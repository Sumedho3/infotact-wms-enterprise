package com.infotact.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.core.context.SecurityContextHolder;

@SpringBootApplication
public class InventoryServiceApplication {

	public static void main(String[] args) {
		System.setProperty(
	            SecurityContextHolder.SYSTEM_PROPERTY, 
	            SecurityContextHolder.MODE_INHERITABLETHREADLOCAL
	        );
		SpringApplication.run(InventoryServiceApplication.class, args);
	}

}
