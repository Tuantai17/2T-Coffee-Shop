package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Menu;

import java.util.List;

public interface MenuService {
    List<Menu> getAllMenus();
    List<Menu> getPublicMenus();
    Menu getMenuById(Long id);
    Menu createMenu(Menu menu);
    Menu updateMenu(Long id, Menu menu);
    Menu updateMenuStatus(Long id, Boolean isActive);
    void deleteMenu(Long id);
    void deleteBulkMenus(List<Long> ids);
}
