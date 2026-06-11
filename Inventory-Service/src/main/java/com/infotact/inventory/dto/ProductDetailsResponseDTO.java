package com.infotact.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDetailsResponseDTO {
	
	private Long id;
    private String name;
    private String description;
    private String category;
    private int currentTotalStock;
}
