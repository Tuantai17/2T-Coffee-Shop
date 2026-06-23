package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Menu;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.MenuService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminMenuController {

    @Autowired
    private MenuService menuService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping("/menus")
    public ResponseEntity<List<Menu>> getAllMenus() {
        List<Menu> menus = menuService.getAllMenus();
        return new ResponseEntity<>(menus, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @GetMapping("/menus/{id}")
    public ResponseEntity<Menu> getMenuById(@PathVariable("id") Long id) {
        Menu menu = menuService.getMenuById(id);
        if (menu == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(menu, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PostMapping("/menus")
    public ResponseEntity<?> addMenu(@RequestBody Menu menu, HttpServletRequest request) {
        try {
            Menu created = menuService.createMenu(menu);
            return new ResponseEntity<>(
                    created,
                    headerGenerator.getHeadersForSuccessPostMethod(request, created.getId()),
                    HttpStatus.CREATED
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/menus/{id}")
    public ResponseEntity<?> updateMenu(@PathVariable("id") Long id, @RequestBody Menu menu) {
        try {
            Menu updated = menuService.updateMenu(id, menu);
            if (updated == null) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(updated, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/menus/{id}/status")
    public ResponseEntity<Menu> updateMenuStatus(@PathVariable("id") Long id, @RequestBody Map<String, Boolean> body) {
        Boolean isActive = body.get("isActive");
        Menu updated = menuService.updateMenuStatus(id, isActive);
        if (updated == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(updated, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @DeleteMapping("/menus/{id}")
    public ResponseEntity<?> deleteMenu(@PathVariable("id") Long id) {
        try {
            menuService.deleteMenu(id);
            return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/menus/bulk")
    public ResponseEntity<Void> deleteBulkMenus(@RequestBody List<Long> ids) {
        menuService.deleteBulkMenus(ids);
        return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }
}
