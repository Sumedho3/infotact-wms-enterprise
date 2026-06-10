import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';

/**
 * OrderFulfillment Component (Week 3 Inventory Deduction Desk)
 * Captures manual or scanned dispatch events and submits an operational status packet 
 * to your transactional Spring Boot service layer to deduct PostgreSQL stocks sequentially.
 */
const OrderFulfillment = ({ onOrderPacked, userProfile }) => {
    // Form Entry States
    const [orderIdInput, setOrderIdInput] = useState('');
    const [productIdInput, setProductIdInput] = useState('');
    const [quantityInput, setQuantityInput] = useState(1);
    
    // UI Operational States
    const [isProcessing, setIsProcessing] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    
    // 🎯 NEW MODAL STATES (Replaces browser alert with a manual close modal)
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');

    // 📤 CONNECTED TO WEEK 3: Submits the transactional collection array packet
    const handleProcessDeduction = async (e) => {
        e.preventDefault();

        if (!orderIdInput.trim() || !productIdInput.trim() || quantityInput < 1) {
            setModalTitle("Operational Warning");
            setModalContent("Please populate all fields with valid data attributes before processing.");
            setModalVisible(true);
            return;
        }

        const orderStatusUpdateRequest = {
            status: "PACKED",
            items: [
                {
                    productId: parseInt(productIdInput.trim(), 10),
                    orderedQuantity: parseInt(quantityInput, 10)
                }
            ]
        };

        try {
            setIsProcessing(true);

            const endpointPath = `/api/orders/${encodeURIComponent(orderIdInput.trim())}/status`;
            await axiosClient.put(endpointPath, orderStatusUpdateRequest);

            // Trigger Success Auto-Vanishing Toast
            setToastMessage(`Success: Order #${orderIdInput} Dispatched! Stock allocated and deducted from Storage bins.`);
            setTimeout(() => setToastMessage(''), 4000);

            if (onOrderPacked) {
                await onOrderPacked();
            }

            setOrderIdInput('');
            setProductIdInput('');
            setQuantityInput(1);

        } catch (err) {
            console.error("Fulfillment Transaction Failed:", err);
            
            // 🎯 CAPTURE BACKEND EXCEPTION MESSAGE: Grabs your custom Spring Boot text dynamically!
            const errorReason = err.response?.data?.message || "Deduction rejected. Check if adequate stock footprints exist across your bins.";
            
            // Launch the styled custom modal (Will NOT auto-close, requires manual OK click)
            setModalTitle("Fulfillment Exception");
            setModalContent(errorReason);
            setModalVisible(true);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Success Auto-Hide Toast Banner */}
            {toastMessage && (
                <div style={styles.toast}>
                    <span style={styles.toastIcon}>📦</span>
                    {toastMessage}
                </div>
            )}

            {/* 🎯 NEW STYLED MODAL OVERLAY (Triggers on stock exceptions) */}
            {modalVisible && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <div style={styles.modalHeader}>
                            ⚠️ {modalTitle}
                        </div>
                        <div style={styles.modalBody}>
                            {modalContent}
                        </div>
                        <div style={styles.modalFooter}>
                            <button 
                                type="button" 
                                onClick={() => setModalVisible(false)} // 🎯 Closes manually on OK click
                                style={styles.modalBtn}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.panelHeader}>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={styles.panelTitle}>Active Order Fulfillment Center (Week 3 Desk)</h2>
                    <p style={styles.panelSubtitle}>Input outbound shipping manifests to execute live transactional sequential stock deductions.</p>
                </div>
            </div>

            <form onSubmit={handleProcessDeduction} style={styles.formLayout}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Voucher Order ID Reference:</label>
                    <input 
                        type="number"
                        placeholder="e.g., 101"
                        value={orderIdInput}
                        onChange={(e) => setOrderIdInput(e.target.value)}
                        style={styles.textInput}
                        disabled={isProcessing}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={{ ...styles.label, borderLeft: '3px solid #007bff', paddingLeft: '6px' }}>Target Product ID:</label>
                    <input 
                        type="number"
                        placeholder="e.g., 1"
                        value={productIdInput}
                        onChange={(e) => productIdInput === 0 ? setProductIdInput(e.target.value) : setProductIdInput(e.target.value)}
                        style={styles.textInput}
                        disabled={isProcessing}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Ordered Quantity Volume:</label>
                    <input 
                        type="number"
                        min="1"
                        value={quantityInput === 0 ? '' : quantityInput}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') setQuantityInput(0);
                            else {
                                const parsed = parseInt(val, 10);
                                setQuantityInput(isNaN(parsed) ? 1 : parsed);
                            }
                        }}
                        onBlur={() => { if (quantityInput < 1) setQuantityInput(1); }}
                        style={styles.textInput}
                        disabled={isProcessing}
                    />
                </div>

                <div style={styles.btnWrapper}>
                    <button 
                        type="submit" 
                        style={isProcessing ? styles.processingBtn : styles.actionBtn}
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Processing Deductions..." : "Pack & Deduct Stock"}
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: { background: '#ffffff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '30px' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #f1f3f5', paddingBottom: '15px' },
    panelTitle: { margin: 0, fontSize: '18px', color: '#212529', fontWeight: 'bold' },
    panelSubtitle: { margin: '5px 0 0 0', fontSize: '13px', color: '#6c757d' },
    formLayout: { display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', textAlign: 'left' },
    inputGroup: { flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', color: '#495057', fontWeight: 'bold' },
    textInput: { padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px', outline: 'none' },
    btnWrapper: { minWidth: '200px', display: 'flex' },
    actionBtn: { width: '100%', background: '#dc3545', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
    processingBtn: { width: '100%', background: '#c82333', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '4px', cursor: 'not-allowed', fontWeight: 'bold', fontSize: '14px' },
    toast: { position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#28a745', color: '#ffffff', padding: '16px 28px', borderRadius: '6px', boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)', fontSize: '14px', fontWeight: 'bold', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px' },
    toastIcon: { fontSize: '18px' },
    
    // 🎯 NEW MODAL CSS MATRIX STYLES
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
    modalCard: { background: '#ffffff', minWidth: '350px', maxWidth: '500px', borderRadius: '6px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    modalHeader: { background: '#fff3cd', color: '#856404', padding: '16px 20px', fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid #ffeeba', textAlign: 'left' },
    modalBody: { padding: '20px', color: '#721c24', fontSize: '14px', textAlign: 'left', backgroundColor: '#fdf8e2', lineHeight: '1.5', fontWeight: '500' },
    modalFooter: { padding: '12px 20px', background: '#f8f9fa', borderTop: '1px solid #dee2e6', display: 'flex', justifyContent: 'flex-end' },
    modalBtn: { background: '#856404', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }
};

export default OrderFulfillment;