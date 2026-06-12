import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

/**
 * OrderCreationConsole Component (Panel A)
 * Refactored to eliminate native browser alert boxes and utilize an
 * integrated enterprise-grade custom modal overlay notification system.
 */
const OrderCreationConsole = ({ onOrderStagedSuccessfully }) => {
    // Lookup input & verified data state hooks
    const [productIdInput, setProductIdInput] = useState('');
    const [scannedProduct, setScannedProduct] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    // Cart compilation states for multi-product orders
    const [quantityInput, setQuantityInput] = useState('');
    const [stagedCartItems, setStagedCartItems] = useState([]);
    const [submissionError, setSubmissionError] = useState('');

    // 🎯 NEW: MODERN MODAL STATE MACHINE CONTEXTS
    const [customModalOpen, setCustomModalOpen] = useState(false);
    const [customModalConfig, setCustomModalConfig] = useState({
        type: 'SUCCESS', // 'SUCCESS' or 'WARNING'
        title: '',
        message: ''
    });

    // Helper to dispatch modern modal alerts
    const triggerNotificationModal = (type, title, message) => {
        setCustomModalConfig({ type, title, message });
        setCustomModalOpen(true);
    };

    // Trigger dynamic lookup automatically when a valid ID is typed
    useEffect(() => {
        if (!productIdInput.trim() || isNaN(productIdInput)) {
            setScannedProduct(null);
            setLookupError('');
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLookupLoading(true);
            setLookupError('');
            try {
                const response = await axiosClient.get(`/api/products/${productIdInput.trim()}`);
                setScannedProduct(response.data);
            } catch (err) {
                console.error("Catalog look up failure:", err);
                setScannedProduct(null);
                setLookupError(err.response?.data?.error || "Product ID not found in catalog registries.");
            } finally {
                setLookupLoading(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [productIdInput]);

    // Adds a validated product line item to the local staging layout list
    const handleAddLineItemToCart = (e) => {
        e.preventDefault();
        
        const qty = parseInt(quantityInput, 10);
        if (!scannedProduct || !qty || qty <= 0) {
            triggerNotificationModal(
                'WARNING',
                'Validation Requirement',
                'Please input a valid target product selection quantity volume greater than 0 before appending rows.'
            );
            return;
        }

        const existingItemIndex = stagedCartItems.findIndex(item => item.productId === scannedProduct.id);
        
        if (existingItemIndex > -1) {
            const updatedCart = [...stagedCartItems];
            updatedCart[existingItemIndex].quantity += qty;
            setStagedCartItems(updatedCart);
        } else {
            setStagedCartItems([
                ...stagedCartItems,
                {
                    productId: scannedProduct.id,
                    skuCode: scannedProduct.sku || 'N/A',
                    productName: scannedProduct.name,
                    quantity: qty,
                    description: scannedProduct.description
                }
            ]);
        }

        setProductIdInput('');
        setQuantityInput('');
        setScannedProduct(null);
    };

    // Submits the complete multi-product cart list to your Spring Boot REST engine
    const handleCommitOrderToDatabase = async () => {
        if (stagedCartItems.length === 0) return;

        setSubmissionError('');
        const requestPayload = stagedCartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }));

        try {
            await axiosClient.post('/api/orders', requestPayload);
            
            setStagedCartItems([]);
            
            // 🎯 REPLACED BROWSER ALERT WITH A WELL-STRUCTURED MODERN DESIGN
            triggerNotificationModal(
                'SUCCESS',
                'Staging Success Manifest',
                'Order Staged to Pending Queue Successfully!'
            );
            
            if (onOrderStagedSuccessfully) {
                onOrderStagedSuccessfully();
            }
        } catch (err) {
            console.error("Order staging pipeline failure:", err);
            setSubmissionError(err.response?.data?.error || "Failed to commit order manifest to server tracking.");
        }
    };

    const handleRemoveCartRow = (index) => {
        setStagedCartItems(stagedCartItems.filter((_, i) => i !== index));
    };

    return (
        <div style={panelStyles.container}>
            
            {/* ====================================================================
                🎯 NEW CUSTOM NOTIFICATION MODAL DIALOG CONTAINER
               ==================================================================== */}
            {customModalOpen && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.card}>
                        <div style={{
                            ...modalStyles.header,
                            background: customModalConfig.type === 'SUCCESS' ? '#28a745' : '#fff3cd',
                            color: customModalConfig.type === 'SUCCESS' ? '#ffffff' : '#856404',
                            borderBottom: customModalConfig.type === 'SUCCESS' ? '1px solid #1e7e34' : '1px solid #ffeeba'
                        }}>
                            {customModalConfig.type === 'SUCCESS' ? '🎉 ' : '⚠️ '} 
                            {customModalConfig.title}
                        </div>
                        <div style={modalStyles.body}>
                            {customModalConfig.message}
                        </div>
                        <div style={modalStyles.footer}>
                            <button 
                                type="button" 
                                onClick={() => setCustomModalOpen(false)}
                                style={{
                                    ...modalStyles.closeBtn,
                                    background: customModalConfig.type === 'SUCCESS' ? '#28a745' : '#856404',
                                }}
                            >
                                Acknowledge & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={panelStyles.panelHeader}>
                <h3 style={panelStyles.sectionTitle}>🛒 Create Order Console (Multi-Product Manifest Builder)</h3>
            </div>

            <div style={panelStyles.gridWrapper}>
                {/* Left Form: Scanning Inputs */}
                <form onSubmit={handleAddLineItemToCart} style={panelStyles.formSide}>
                    <div style={panelStyles.inputGroup}>
                        <label style={panelStyles.fieldLabel}>Product ID</label>
                        <input
                            type="text"
                            placeholder="Type or Scan Product ID (e.g., 1)"
                            value={productIdInput}
                            onChange={(e) => setProductIdInput(e.target.value)}
                            style={panelStyles.inputField}
                        />
                        {lookupLoading && <small style={{ color: '#007bff' }}>Verifying database rows...</small>}
                        {lookupError && <small style={{ color: '#dc3545', fontWeight: 'bold' }}>{lookupError}</small>}
                    </div>

                    {/* Metadata Preview Banner */}
                    {scannedProduct && (
                        <div style={panelStyles.metadataPreviewBanner}>
                            <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                <strong>Name:</strong> {scannedProduct.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                                <strong>Spec:</strong> {scannedProduct.description}
                            </div>
                            <div style={{ fontSize: '12px', color: '#495057', marginBottom: '6px' }}>
                                <strong>Category:</strong> <span style={panelStyles.catBadge}>{scannedProduct.category}</span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                Current Total Stock: {' '}
                                <span style={{ color: scannedProduct.currentTotalStock > 0 ? '#28a745' : '#dc3545' }}>
                                    {scannedProduct.currentTotalStock} Units Available
                                </span>
                            </div>
                        </div>
                    )}

                    <div style={panelStyles.inputGroup}>
                        <label style={panelStyles.fieldLabel}>Order Quantity Volume</label>
                        <input
                            type="number"
                            min="1"
                            placeholder="Enter Quantity Volume"
                            value={quantityInput}
                            onChange={(e) => setQuantityInput(e.target.value)}
                            style={panelStyles.inputField}
                            disabled={!scannedProduct}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            ...panelStyles.addButton,
                            opacity: scannedProduct ? 1 : 0.6,
                            cursor: scannedProduct ? 'pointer' : 'not-allowed'
                        }}
                        disabled={!scannedProduct}
                    >
                        ➕ Add Line Item to Manifest
                    </button>
                </form>

                {/* Right Form: Staged Manifest Items List */}
                <div style={panelStyles.cartSide}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#495057', textTransform: 'uppercase' }}>
                        Current Manifest Summary List ({stagedCartItems.length} lines)
                    </h4>

                    {submissionError && <div style={panelStyles.errorText}>{submissionError}</div>}

                    <div style={panelStyles.manifestScrollArea}>
                        {stagedCartItems.length === 0 ? (
                            <div style={panelStyles.emptyCartPlaceholder}>
                                Manifest is empty. Scan products on the left side to compile item groups.
                            </div>
                        ) : (
                            stagedCartItems.map((item, idx) => (
                                <div key={idx} style={panelStyles.cartRow}>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.productName} (ID #{item.productId})</div>
                                        <div style={{ fontSize: '11px', color: '#6c757d' }}>{item.description}</div>
                                    </div>
                                    <div style={panelStyles.qtyBadge}>{item.quantity} Units</div>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveCartRow(idx)}
                                        style={panelStyles.removeRowBtn}
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleCommitOrderToDatabase}
                        style={{
                            ...panelStyles.commitButton,
                            opacity: stagedCartItems.length > 0 ? 1 : 0.5,
                            cursor: stagedCartItems.length > 0 ? 'pointer' : 'not-allowed'
                        }}
                        disabled={stagedCartItems.length === 0}
                    >
                        📦 Create Order (Commit Staged Manifest)
                    </button>
                </div>
            </div>
        </div>
    );
};

// Layout Sheet Component Matrices
const panelStyles = {
    container: { background: '#ffffff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '30px' },
    panelHeader: { borderBottom: '1px solid #f1f3f5', paddingBottom: '10px', marginBottom: '20px' },
    sectionTitle: { margin: 0, fontSize: '18px', color: '#212529', fontWeight: 'bold', textAlign: 'left' },
    gridWrapper: { display: 'flex', gap: '30px', flexWrap: 'wrap' },
    formSide: { flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '15px' },
    cartSide: { flex: '1 1 450px', background: '#f8f9fa', padding: '20px', borderRadius: '6px', border: '1px solid #e9ecef', display: 'flex', flexDirection: 'column' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' },
    fieldLabel: { fontSize: '13px', fontWeight: '600', color: '#495057' },
    inputField: { padding: '10px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', boxSizing: 'border-box', width: '100%' },
    metadataPreviewBanner: { background: '#e8f0fe', borderLeft: '4px solid #1a73e8', padding: '12px 15px', borderRadius: '4px', textAlign: 'left' },
    catBadge: { fontSize: '11px', background: '#fff', padding: '1px 6px', borderRadius: '3px', border: '1px solid #ced4da', fontWeight: 'bold' },
    addButton: { padding: '12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' },
    manifestScrollArea: { flex: 1, minHeight: '160px', maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' },
    emptyCartPlaceholder: { color: '#6c757d', fontSize: '13px', padding: '40px 20px', textAlign: 'center', border: '2px dashed #dee2e6', borderRadius: '4px', backgroundColor: '#fff' },
    cartRow: { background: '#ffffff', border: '1px solid #dee2e6', padding: '10px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px' },
    qtyBadge: { background: '#e9ecef', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: '#495057', whiteSpace: 'nowrap' },
    removeRowBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '4px' },
    commitButton: { padding: '14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    errorText: { padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '10px', fontSize: '13px', textAlign: 'center' }
};

// 🎯 NEW STYLES SHEET FOR THE REFACTORED MODAL INTERFACE
const modalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 },
    card: { background: '#ffffff', minWidth: '380px', maxWidth: '520px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    header: { padding: '16px 20px', fontWeight: 'bold', fontSize: '16px', textAlign: 'left', letterSpacing: '0.3px' },
    body: { padding: '22px 20px', color: '#495057', fontSize: '14px', textAlign: 'left', backgroundColor: '#ffffff', lineHeight: '1.5', fontWeight: '500' },
    footer: { padding: '12px 20px', background: '#f8f9fa', borderTop: '1px solid #dee2e6', display: 'flex', justifyContent: 'flex-end' },
    closeBtn: { color: '#ffffff', border: 'none', padding: '9px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'opacity 0.2s' }
};

export default OrderCreationConsole;