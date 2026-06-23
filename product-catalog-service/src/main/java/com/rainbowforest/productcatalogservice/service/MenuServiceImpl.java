package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Menu;
import com.rainbowforest.productcatalogservice.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuServiceImpl implements MenuService {

    @Autowired
    private MenuRepository menuRepository;

    @Override
    public List<Menu> getAllMenus() {
        return menuRepository.findAllByOrderByDisplayOrderAsc();
    }

    @Override
    public List<Menu> getPublicMenus() {
        List<Menu> allActive = menuRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        return buildMenuTree(allActive);
    }

    private List<Menu> buildMenuTree(List<Menu> menus) {
        List<Menu> roots = new ArrayList<>();
        for (Menu menu : menus) {
            if (menu.getParentId() == null) {
                menu.setChildren(getChildrenRecursively(menu.getId(), menus));
                roots.add(menu);
            }
        }
        return roots;
    }

    private List<Menu> getChildrenRecursively(Long parentId, List<Menu> allMenus) {
        List<Menu> children = allMenus.stream()
                .filter(m -> parentId.equals(m.getParentId()))
                .collect(Collectors.toList());
        for (Menu child : children) {
            child.setChildren(getChildrenRecursively(child.getId(), allMenus));
        }
        return children;
    }

    @Override
    public Menu getMenuById(Long id) {
        return menuRepository.findById(id).orElse(null);
    }

    @Override
    public Menu createMenu(Menu menu) {
        if (menu.getParentId() != null) {
            Menu parent = getMenuById(menu.getParentId());
            if (parent == null) {
                throw new IllegalArgumentException("Menu cha không hợp lệ.");
            }
        }
        if (menu.getSlug() != null && menuRepository.existsBySlug(menu.getSlug())) {
            menu.setSlug(menu.getSlug() + "-" + System.currentTimeMillis());
        }
        return menuRepository.save(menu);
    }

    @Override
    public Menu updateMenu(Long id, Menu menuDetails) {
        Menu menu = getMenuById(id);
        if (menu != null) {
            if (menuDetails.getParentId() != null) {
                if (menuDetails.getParentId().equals(id)) {
                    throw new IllegalArgumentException("Không thể chọn chính nó làm cha.");
                }
                Menu parent = getMenuById(menuDetails.getParentId());
                if (parent == null) {
                    throw new IllegalArgumentException("Menu cha không hợp lệ.");
                }
                // Check if the new parent is actually a descendant
                if (isDescendant(id, menuDetails.getParentId())) {
                    throw new IllegalArgumentException("Không thể chọn menu con làm menu cha.");
                }
            }

            menu.setName(menuDetails.getName());
            if (menuDetails.getSlug() != null && !menuDetails.getSlug().equals(menu.getSlug())) {
                if (menuRepository.existsBySlug(menuDetails.getSlug())) {
                    menu.setSlug(menuDetails.getSlug() + "-" + System.currentTimeMillis());
                } else {
                    menu.setSlug(menuDetails.getSlug());
                }
            }
            menu.setPath(menuDetails.getPath());
            menu.setParentId(menuDetails.getParentId());
            menu.setDisplayOrder(menuDetails.getDisplayOrder());
            menu.setIsActive(menuDetails.getIsActive());
            menu.setIcon(menuDetails.getIcon());
            return menuRepository.save(menu);
        }
        return null;
    }

    @Override
    public Menu updateMenuStatus(Long id, Boolean isActive) {
        Menu menu = getMenuById(id);
        if (menu != null) {
            menu.setIsActive(isActive);
            return menuRepository.save(menu);
        }
        return null;
    }

    @Override
    public void deleteMenu(Long id) {
        // Delete all children recursively before deleting this menu
        List<Menu> children = menuRepository.findByParentId(id);
        if (children != null && !children.isEmpty()) {
            for (Menu child : children) {
                deleteMenu(child.getId());
            }
        }
        menuRepository.deleteById(id);
    }

    @Override
    public void deleteBulkMenus(List<Long> ids) {
        for (Long id : ids) {
            try {
                deleteMenu(id);
            } catch (IllegalStateException e) {
                // Ignore those that cannot be deleted due to children
            }
        }
    }

    private boolean isDescendant(Long parentId, Long childId) {
        Menu child = getMenuById(childId);
        while (child != null && child.getParentId() != null) {
            if (child.getParentId().equals(parentId)) {
                return true;
            }
            child = getMenuById(child.getParentId());
        }
        return false;
    }
}
