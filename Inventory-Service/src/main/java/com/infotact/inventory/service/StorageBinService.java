package com.infotact.inventory.service;

import java.util.List;

import com.infotact.inventory.dto.StorageBinRequestDTO;
import com.infotact.inventory.dto.StorageBinResponseDTO;
import com.infotact.inventory.entity.StorageBin;

public interface StorageBinService {
	
	public StorageBin createStorageBin(StorageBinRequestDTO dto);

	public List<StorageBinResponseDTO> getItems();
}
