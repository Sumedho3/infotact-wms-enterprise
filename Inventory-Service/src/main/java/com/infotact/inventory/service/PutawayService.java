package com.infotact.inventory.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infotact.inventory.entity.StorageBin;
import com.infotact.inventory.repository.StorageBinRepository;

@Service
public class PutawayService {

    @Autowired
    private StorageBinRepository storageBinRepository;

    public Long findAvailableBin() {

        List<StorageBin> bins = storageBinRepository.findAll();

        if (bins.isEmpty()) {
            throw new RuntimeException("No storage bins available");
        }

        // For now choose the first available bin
        StorageBin selectedBin = bins.get(0);

        return selectedBin.getId();
    }
}