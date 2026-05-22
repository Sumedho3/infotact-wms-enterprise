package com.infotact.inventory.service;

import com.infotact.inventory.dto.StorageBinRequestDTO;
import com.infotact.inventory.entity.StorageBin;

public interface StorageBinService {
	
	public StorageBin createStorageBin(StorageBinRequestDTO dto);
}
