package com.rainbowforest.orderservice.dto.catalog;

import lombok.Data;
import java.util.List;

@Data
public class CatalogOptionGroupDto {
    private Long id;
    private String name;
    private boolean required;
    private boolean multiSelect;
    private List<CatalogOptionDto> options;
}
