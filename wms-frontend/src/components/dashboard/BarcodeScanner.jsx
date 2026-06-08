import React, { useState, useEffect, useRef } from 'react';

/**
 * BarcodeScanner Component
 * Listens globally for rapid hardware input streams simulating laser barcode scans.
 */
const BarcodeScanner = ({ onScanSuccess }) => {
    const [scannedInput, setScannedInput] = useState('');
    const [manualSku, setManualSku] = useState('');
    const [scannerStatus, setScannerStatus] = useState('Ready for hardware input...');
    const bufferRef = useRef('');
    const lastKeyTimeRef = useRef(0);

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            const currentTime = Date.now();
            
            // Physical laser guns type incredibly fast (usually less than 30ms between keystrokes)
            const isHardwareStream = currentTime - lastKeyTimeRef.current < 35 || bufferRef.current.length === 0;
            lastKeyTimeRef.current = currentTime;

            if (e.key === 'Enter') {
                if (bufferRef.current.length > 3) {
                    const finalSku = bufferRef.current.trim();
                    processScan(finalSku);
                }
                bufferRef.current = ''; // Flush hardware buffer string
            } else if (e.key.length === 1 && isHardwareStream) {
                bufferRef.current += e.key;
            } else if (!isHardwareStream) {
                // If character gaps take too long, it's a human typing, not a scanner gun
                bufferRef.current = '';
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const processScan = (sku) => {
        setScannedInput(sku);
        setScannerStatus(`Success: Decoded SKU [${sku}]`);
        onScanSuccess(sku); // Send scanned SKU code straight up to parent state array
        
        // Auto-reset status message banner after brief delay
        setTimeout(() => setScannerStatus('Ready for hardware input...'), 4000);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualSku.trim()) {
            processScan(manualSku.trim().toUpperCase());
            setManualSku('');
        }
    };

    return (
        <div style={styles.scannerWrapper}>
            <div style={styles.statusSection}>
                <div style={styles.indicatorContainer}>
                    <span style={styles.pulseDot}></span>
                    <h3 style={styles.heading}>Hardware Engine Active</h3>
                </div>
                <p style={styles.statusMsg}>{scannerStatus}</p>
                {scannedInput && (
                    <div style={styles.badge}>Last Scanned: <strong>{scannedInput}</strong></div>
                )}
            </div>

            <form onSubmit={handleManualSubmit} style={styles.manualForm}>
                <input 
                    type="text" 
                    placeholder="Or enter SKU manually (e.g., PROD-SKU-2026)" 
                    value={manualSku}
                    onChange={(e) => setManualSku(e.target.value)}
                    style={styles.input}
                />
                <button type="submit" style={styles.btn}>Override Entry</button>
            </form>
        </div>
    );
};

const styles = {
    scannerWrapper: { background: '#ffffff', padding: '20px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderLeft: '5px solid #007bff' },
    statusSection: { textAlign: 'left' },
    indicatorContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
    pulseDot: { width: '8px', height: '8px', backgroundColor: '#28a745', borderRadius: '50%' },
    heading: { margin: 0, fontSize: '15px', color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px' },
    statusMsg: { margin: '5px 0 0 0', fontSize: '13px', color: '#6c757d', fontStyle: 'italic' },
    badge: { marginTop: '8px', display: 'inline-block', backgroundColor: '#e8f0fe', color: '#1a73e8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' },
    manualForm: { display: 'flex', gap: '10px', flexGrow: 1, justifyContent: 'flex-end', maxWidth: '500px', width: '100%' },
    input: { padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', width: '100%', fontSize: '14px' },
    btn: { padding: '10px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' }
};

export default BarcodeScanner;