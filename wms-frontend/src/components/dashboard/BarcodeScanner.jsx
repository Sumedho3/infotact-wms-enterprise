import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';

/**
 * BarcodeScanner Component (Intake & Labeling Center)
 * Implements the user's custom workflow: Generates barcodes from an SKU,
 * allows asset downloading, and pipes token strings seamlessly over to the receiving dock logic.
 */
const BarcodeScanner = ({ onTransferToDock, activeWarehouseLocation }) => {
    const [skuInput, setSkuInput] = useState('');
    const [generatedSku, setGeneratedSku] = useState('');
    const [barcodeImgUrl, setBarcodeImgUrl] = useState('');
    const [quantityInput, setQuantityInput] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);

    // 🎯 CONNECTED TO WEEK 3: Hit the Barcode Generation API using the SKU text string
    const handleGenerateBarcode = async (e) => {
        e.preventDefault();
        if (!skuInput.trim()) return;

        try {
            setIsGenerating(true);
            
            // 1. Hit your Week 3 endpoint normally (expects default JSON response data)
            const response = await axiosClient.get(`/api/barcodes/generate?sku=${encodeURIComponent(skuInput.trim())}`);
            
            // 2. Extract the Base64 data string straight out of your custom response body key matching Postman
            const base64DataUri = response.data.barcodeBase64; 
            
            // 3. Assign the pure string directly to the image rendering state
            setBarcodeImgUrl(base64DataUri);
            setGeneratedSku(skuInput.trim());
        } catch (err) {
            console.error("Failed to extract barcode JSON payload context:", err);
            alert("Verification Error: Unable to read authenticated barcode JSON parameters from server.");
        } finally {
            setIsGenerating(false);
        }
    };

    // 🎯 OPTION 1: Download the Barcode Label Asset file for physical warehouse use
    const handleDownloadLabel = () => {
        if (!barcodeImgUrl) return;
        
        // Since it's already a complete Data-URI string, bind it directly to the download gate anchor link!
        const linkElement = document.createElement('a');
        linkElement.href = barcodeImgUrl;
        linkElement.download = `LABEL-${generatedSku}.png`;
        
        document.body.appendChild(linkElement);
        linkElement.click();
        linkElement.remove();
    };

    // 🎯 OPTION 2: Automatically transfer the SKU token and custom quantity to the Week 2 Receiving API
    const handleLocalTransferTrigger = () => {
		if (!generatedSku) return;
		if (quantityInput < 1) {
			alert("Operational Error: Please type a valid inventory intake volume quantity.");
			return;
		}
		
		onTransferToDock(generatedSku, quantityInput);
		
		setSkuInput('');
		setGeneratedSku('');
		setBarcodeImgUrl('');
		setQuantityInput(1);
	};

    return (
        <div style={styles.container}>
            <div style={styles.panelHeader}>
                <span style={styles.icon}>🏷️</span>
                <h2 style={styles.title}>Intake & Labeling Center</h2>
            </div>

            <div style={styles.workflowSplit}>
                {/* Left Control Input Block */}
                <form onSubmit={handleGenerateBarcode} style={styles.form}>
                    <label style={styles.label}>Enter Catalog SKU Code Reference:</label>
                    <div style={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="e.g., BEV-NTS-DRK01"
                            value={skuInput}
                            onChange={(e) => setSkuInput(e.target.value)}
                            style={styles.textInput}
                        />
                        <button type="submit" disabled={isGenerating} style={styles.primaryBtn}>
                            {isGenerating ? 'Generating...' : 'Generate Barcode'}
                        </button>
                    </div>
                </form>

                {/* Right Visual Output Actions Matrix Block */}
                {barcodeImgUrl && (
                    <div style={styles.outputWorkspace}>
                        <div style={styles.imageCard}>
                            <p style={styles.skuBadge}>SKU: {generatedSku}</p>
                            <img 
                                src={barcodeImgUrl} 
                                alt={`Barcode for ${generatedSku}`} 
                                style={styles.barcodeImg} 
                            />
                            <button onClick={handleDownloadLabel} style={styles.secondaryBtn}>
                                💾 Download Asset Sticker
                            </button>
                        </div>

                        {/* Interactive Transfer Form Panel */}
                        <div style={styles.transferFormCard}>
                            <h4 style={styles.formTitle}>🚀 Transfer to Receiving Dock</h4>
                            <p style={styles.metaText}>
                                Target Destination: <strong>{activeWarehouseLocation || 'Loading Profile...'}</strong>
                            </p>
                            
                            <label style={styles.label}>Define Intake Item Volume Quantity:</label>
							<input 
								type="number" 
								min="1" 
								value={quantityInput === 0 ? '' : quantityInput} 
								onChange={(e) => {
									const val = e.target.value;
									if (val === '') {
										setQuantityInput(0); // Allow temporary blank space while typing
									} else {
										const parsed = parseInt(val, 10);
										setQuantityInput(isNaN(parsed) ? 1 : parsed);
									}
								}}
								onBlur={() => {
									if (quantityInput < 1) setQuantityInput(1); // Safety fallback when focus leaves field
								}}
								style={styles.numInput}
							/>

                            <button onClick={handleLocalTransferTrigger} style={styles.successBtn}>
                                Confirm Inventory Placement
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { background: '#ffffff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '30px' },
    panelHeader: { display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f1f3f5', paddingBottom: '12px', marginBottom: '20px' },
    icon: { fontSize: '22px' },
    title: { margin: 0, fontSize: '20px', color: '#212529', fontWeight: 'bold' },
    workflowSplit: { display: 'flex', flexDirection: 'column', gap: '25px' },
    form: { display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
    label: { fontSize: '13px', fontWeight: '600', color: '#495057', textTransform: 'uppercase' },
    inputGroup: { display: 'flex', gap: '10px' },
    textInput: { flex: 1, padding: '12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px', fontFamily: 'Courier New, monospace', fontWeight: 'bold' },
    primaryBtn: { padding: '12px 24px', background: '#007bff', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
    outputWorkspace: { display: 'flex', gap: '20px', flexWrap: 'wrap', background: '#f8f9fa', padding: '20px', borderRadius: '6px', border: '1px solid #e9ecef' },
    imageCard: { background: '#ffffff', padding: '15px', borderRadius: '4px', border: '1px solid #dee2e6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minWidth: '220px' },
    skuBadge: { margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#6c757d', fontFamily: 'monospace' },
    barcodeImg: { maxWidth: '100%', height: 'auto', border: '1px dashed #dee2e6', padding: '5px' },
    secondaryBtn: { width: '100%', padding: '8px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' },
    transferFormCard: { flex: 1, background: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid #dee2e6', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', minWidth: '280px' },
    formTitle: { margin: 0, fontSize: '15px', color: '#28a745', fontWeight: 'bold' },
    metaText: { margin: 0, fontSize: '13px', color: '#495057' },
    numInput: { padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '15px', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' },
    successBtn: { padding: '12px', background: '#28a745', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: 'auto' }
};

export default BarcodeScanner;