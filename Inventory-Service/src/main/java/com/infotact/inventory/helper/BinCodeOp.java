package com.infotact.inventory.helper;

public class BinCodeOp {

	public static String buildSafeBinCode(String zone, int row, int bin) {
        if (zone == null || zone.trim().isEmpty()) {
            throw new IllegalArgumentException("Zone cannot be empty");
        }
        
        String cleanZone = zone.trim().toUpperCase(); 
        
        return "ZONE-" + cleanZone + "-ROW-" + row + "-BIN-" + bin;
    }
	
	public static void extractBinCodeDetails(String bincode)
	{
		if(bincode == null || !bincode.contains("-"))
		{
			throw new IllegalArgumentException("Invalid BinCode Format");
		}
		
		String[] parts = bincode.split("-");
		
		if(parts.length==6)
		{
			String zone = parts[1];
			int rowNumber = Integer.parseInt(parts[3]);
			int binNumber = Integer.parseInt(parts[5]);
		}
		
	}
}
