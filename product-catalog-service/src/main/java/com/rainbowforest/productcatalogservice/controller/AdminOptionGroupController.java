package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.OptionGroup;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.OptionGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminOptionGroupController {

    @Autowired
    private OptionGroupService optionGroupService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping("/option-groups")
    public ResponseEntity<List<OptionGroup>> getAllOptionGroups(HttpServletRequest request) {
        return new ResponseEntity<>(
            optionGroupService.getAllOptionGroups(),
            headerGenerator.getHeadersForSuccessGetMethod(),
            HttpStatus.OK
        );
    }

    @PostMapping("/option-groups")
    public ResponseEntity<?> addOptionGroup(@RequestBody OptionGroup group, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            OptionGroup saved = optionGroupService.saveOptionGroup(group);
            return new ResponseEntity<>(
                saved,
                headerGenerator.getHeadersForSuccessPostMethod(request, saved.getId()),
                HttpStatus.CREATED
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/option-groups/{id}")
    public ResponseEntity<?> updateOptionGroup(@PathVariable("id") Long id, @RequestBody OptionGroup group, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            OptionGroup existing = optionGroupService.getOptionGroupById(id);
            if (existing == null) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }
            existing.setName(group.getName());
            existing.setRequired(group.isRequired());
            existing.setMultiSelect(group.isMultiSelect());
            
            // Manage Options list safely
            if (existing.getOptions() != null) {
                existing.getOptions().clear();
            }
            if (group.getOptions() != null) {
                group.getOptions().forEach(opt -> opt.setOptionGroup(existing));
                existing.getOptions().addAll(group.getOptions());
            }

            OptionGroup updated = optionGroupService.saveOptionGroup(existing);
            return new ResponseEntity<>(
                updated,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/option-groups/{id}")
    public ResponseEntity<?> deleteOptionGroup(@PathVariable("id") Long id, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !role.contains("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            optionGroupService.deleteOptionGroup(id);
            return new ResponseEntity<>(
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
