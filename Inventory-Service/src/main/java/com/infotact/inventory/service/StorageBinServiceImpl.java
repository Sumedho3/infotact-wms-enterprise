package com.infotact.inventory.service;

import org.springframework.stereotype.Service;

import com.infotact.inventory.dto.StorageBinRequestDTO;
import com.infotact.inventory.entity.StorageBin;
import com.infotact.inventory.entity.Warehouse;
import com.infotact.inventory.helper.BinCodeOp;
import com.infotact.inventory.repository.StorageBinRepository;
import com.infotact.inventory.repository.WarehouseRepository;

@Service
public class StorageBinServiceImpl implements StorageBinService{

	private final StorageBinRepository repository;
	private final WarehouseRepository warehouseRepository;
	

	public StorageBinServiceImpl(StorageBinRepository repository, WarehouseRepository warehouseRepository) {
		super();
		this.repository = repository;
		this.warehouseRepository = warehouseRepository;
	}


	@Override
	public StorageBin createStorageBin(StorageBinRequestDTO dto) {
		String bincode = BinCodeOp.buildSafeBinCode(dto.getZone(), dto.getRowNum(), dto.getBinNum());
		StorageBin bin = new StorageBin();
		bin.setBinCode(bincode);
		bin.setAllowedCategory(dto.getAllowedCategory());
		Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId()).orElseThrow(()-> new RuntimeException("Warehouse Not Found"));
		bin.setWarehouse(warehouse);
		
		return repository.save(bin);
	}

}
