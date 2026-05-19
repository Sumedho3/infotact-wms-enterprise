package com.infotact.inventory.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "storage_bins")
public class StorageBin {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String binCode; // e.g., ZONE-A-ROW-1-BIN-5

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    @JsonIgnore
    private Warehouse warehouse;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getBinCode() {
		return binCode;
	}

	public void setBinCode(String binCode) {
		this.binCode = binCode;
	}

	public Warehouse getWarehouse() {
		return warehouse;
	}

	public void setWarehouse(Warehouse warehouse) {
		this.warehouse = warehouse;
	}
    
    
}

