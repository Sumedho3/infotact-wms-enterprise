package com.infotact.inventory.helper;

import com.infotact.inventory.dto.StorageBinResponseDTO;
import com.infotact.inventory.entity.StorageBin;

public class StoragebinMapper {
	
	public static StorageBinResponseDTO mapToDTO(StorageBin bin) {
	    StorageBinResponseDTO dto = new StorageBinResponseDTO();
	    dto.setId(bin.getId());
	    dto.setBinCode(bin.getBinCode());
	    dto.setAllowedCategory(bin.getAllowedCategory());
	    dto.setWarehouseId(bin.getWarehouse().getId());
	    return dto;
	}

}
