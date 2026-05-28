package com.infotact.inventory.dto;

public class StorageBinRequestDTO {
	
	private String zone;
	private Integer rowNum;
	private Integer binNum;
	private String allowedCategory;
	private Long warehouseId;
	
	
	public StorageBinRequestDTO(String zone, Integer rowNum, Integer binNum, String allowedCategory, Long warehouseId) {
		super();
		this.zone = zone;
		this.rowNum = rowNum;
		this.binNum = binNum;
		this.allowedCategory = allowedCategory;
		this.warehouseId = warehouseId;
	}
	public StorageBinRequestDTO() {
	}

	public String getZone() {
		return zone;
	}


	public void setZone(String zone) {
		this.zone = zone;
	}


	public Integer getRowNum() {
		return rowNum;
	}


	public void setRowNum(Integer rowNum) {
		this.rowNum = rowNum;
	}


	public Integer getBinNum() {
		return binNum;
	}


	public void setBinNum(Integer binNum) {
		this.binNum = binNum;
	}


	public String getAllowedCategory() {
		return allowedCategory;
	}


	public void setAllowedCategory(String allowedCategory) {
		this.allowedCategory = allowedCategory;
	}


	public Long getWarehouseId() {
		return warehouseId;
	}


	public void setWarehouseId(Long warehouseId) {
		this.warehouseId = warehouseId;
	}
	
	

}
