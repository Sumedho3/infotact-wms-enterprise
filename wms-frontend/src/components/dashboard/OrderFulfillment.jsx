import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

/**
 * OrderFulfillment Component (Panel B - Week 3 Operational Desk)
 * Refactored to operate as an automated, multi-item pending order queue table view.
 * Replaces native browser confirmation alerts with a clean custom state modal.
 */
const OrderFulfillment = ({ onOrderPacked, userProfile }) => {
    // Active Data Queue State Contexts
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    // REFACTORED ERROR DISPLAY: Captures multi-product exception maps from the server response
    const [anomalyModalVisible, setAnomalyModalVisible] = useState(false);
    const [anomalyTitle, setAnomalyTitle] = useState('');
    const [anomalyManifest, setAnomalyManifest] = useState({});

    // 🎯 NEW: CUSTOM CONFIRM_CANCEL MODAL STATE CONTEXTS
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [orderSelectedForCancel, setOrderSelectedForCancel] = useState(null);

    // 🔄 Fetch all parent orders currently marked as PENDING in PostgreSQL
    const fetchPendingQueue = async () => {
        try {
            setLoading(true);
            setErrorMessage('');
            const response = await axiosClient.get('/api/orders/pending');
            setPendingOrders(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Queue synchronization failure:", err);
            setErrorMessage("Network Error: Unable to synchronize with the outbound pending orders queue.");
        } finally {
            setLoading(false);
        }
    };

    // Automatically trigger queue sync when the workspace component is mounted
    useEffect(() => {
        fetchPendingQueue();
    }, [userProfile?.warehouseId]);

    // 📦 Executes fulfillment deductions across all line items inside a specific parent order ID
    const handlePackAndDeductStock = async (orderId) => {
        setErrorMessage('');
        setToastMessage('');

        try {
            await axiosClient.post(`/api/orders/${orderId}/fulfill`);

            setToastMessage(`Success: Multi-product Order #${orderId} has been successfully packed and dispatched!`);
            setTimeout(() => setToastMessage(''), 4000);

            if (onOrderPacked) {
                await onOrderPacked();
            }
            await fetchPendingQueue();

        } catch (err) {
            console.error("Fulfillment Transaction Failed:", err);

            if (err.response?.status === 422 && err.response?.data?.details) {
                setAnomalyTitle(err.response.data.error || "Order Fulfillment Rejected");
                setAnomalyManifest(err.response.data.details);
                setAnomalyModalVisible(true);
            } else {
                const structuralReason = err.response?.data?.message || err.response?.data?.error || "Fulfillment transaction rejected due to immediate shelf shortages.";
                setErrorMessage(structuralReason);
            }

            if (onOrderPacked) {
                await onOrderPacked();
            }
            await fetchPendingQueue();
        }
    };

    // 🎯 STEP A: Triggers the custom confirmation modal stage overlay instead of a window prompt
    const triggerCancelConfirmation = (orderId) => {
        setOrderSelectedForCancel(orderId);
        setConfirmModalVisible(true);
    };

    // 🎯 STEP B: Executes actual state change transaction to CANCELLED upon modal confirmation
    const handleConfirmCancelAction = async () => {
        if (!orderSelectedForCancel) return;

        const orderId = orderSelectedForCancel;
        setConfirmModalVisible(false); // Instantly dismiss overlay
        setOrderSelectedForCancel(null);
        setErrorMessage('');
        setToastMessage('');

        try {
            await axiosClient.put(`/api/orders/${orderId}/cancel`);

            setToastMessage(`Order #${orderId} cancelled successfully and removed from queue.`);
            setTimeout(() => setToastMessage(''), 4000);

            if (onOrderPacked) {
                await onOrderPacked();
            }
            await fetchPendingQueue();
        } catch (err) {
            console.error("Cancellation transaction rejected:", err);
            setErrorMessage(err.response?.data?.error || "Failed to transmit order cancellation state change updates.");
        }
    };

    return (
        <div style={styles.container}>
            {/* Success Notification Toast Overlay */}
            {toastMessage && (
                <div style={styles.toast}>
                    <span style={styles.toastIcon}>📦</span>
                    {toastMessage}
                </div>
            )}

            {/* ====================================================================
                🎯 NEW: MODERN WELL-STRUCTURED REJECTION CONFIRMATION MODAL OVERLAY
               ==================================================================== */}
            {confirmModalVisible && (
                <div style={styles.modalOverlay}>
                    <div style={styles.confirmCard}>
                        <div style={styles.confirmHeader}>
                            ⚠️ Confirm Action Required
                        </div>
                        <div style={styles.confirmBody}>
                            Are you sure you want to cancel and reject <strong>Order #{orderSelectedForCancel}</strong>? 
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                                This action removes it permanently from active fulfillment desk queues.
                            </p>
                        </div>
                        <div style={styles.modalFooter}>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setConfirmModalVisible(false);
                                    setOrderSelectedForCancel(null);
                                }} 
                                style={styles.discardBtn}
                            >
                                Dismiss & Stay
                            </button>
                            <button 
                                type="button" 
                                onClick={handleConfirmCancelAction} 
                                style={styles.confirmBtn}
                            >
                                Yes, Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* THE MULTI-PRODUCT ANOMALY MODAL SCREEN OVERLAY */}
            {anomalyModalVisible && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <div style={styles.modalHeader}>
                            ⚠️ {anomalyTitle}
                        </div>
                        <div style={styles.modalBody}>
                            <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#721c24' }}>
                                The logistics engine found deficiencies while validating items in this request:
                            </p>
                            <div style={styles.manifestErrorList}>
                                {Object.entries(anomalyManifest).map(([skuCode, failureDetail]) => (
                                    <div key={skuCode} style={styles.errorItemRow}>
                                        <div style={styles.errorSku}><strong>SKU:</strong> {skuCode}</div>
                                        <div style={styles.errorDetail}>{failureDetail}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button 
                                type="button" 
                                onClick={() => setAnomalyModalVisible(false)} 
                                style={styles.modalBtn}
                            >
                                Acknowledge & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.panelHeader}>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={styles.panelTitle}>📋 Active Order Fulfillment Center (Desk Queue)</h2>
                    <p style={styles.panelSubtitle}>Review and process staged multi-product manifests sequentially below.</p>
                </div>
                <button 
                    onClick={fetchPendingQueue} 
                    style={styles.syncQueueButton}
                    disabled={loading}
                >
                    {loading ? "Syncing..." : "🔄 Sync Desk Queue"}
                </button>
            </div>

            {errorMessage && <div style={styles.errorBanner}>{errorMessage}</div>}

            <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={{ ...styles.th, textAlign: 'center', width: '12%' }}>Order ID</th>
                            <th style={{ ...styles.th, textAlign: 'left', width: '53%' }}>Manifest Products & Quantities Breakdown</th>
                            <th style={{ ...styles.th, textAlign: 'center', width: '15%' }}>Current Status</th>
                            <th style={{ ...styles.th, textAlign: 'center', width: '20%' }}>Operational Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingOrders.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={styles.emptyCell}>
                                    All clear! No pending outbound shipping orders staged in this queue workspace.
                                </td>
                            </tr>
                        ) : (
                            pendingOrders.map((order) => (
                                <tr key={order.id} style={styles.tr}>
                                    <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold' }}>
                                        #{order.id}
                                    </td>

                                    <td style={styles.td}>
                                        <div style={styles.itemsWrapper}>
                                            {order.items && order.items.map((item) => (
                                                <div key={item.id} style={styles.productBadge}>
                                                    <span style={styles.prodName}>{item.productName}</span>
                                                    <span style={styles.prodQty}>{item.quantity} Units</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                        <span style={styles.pendingBadge}>{order.status}</span>
                                    </td>

                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                        <div style={styles.actionBtnGroup}>
                                            <button
                                                onClick={() => handlePackAndDeductStock(order.id)}
                                                style={styles.actionBtn}
                                            >
                                                Pack & Deduct
                                            </button>
                                            
                                            {/* 🎯 TRIGGERS OUR DYNAMIC HANDLER METHOD */}
                                            <button
                                                onClick={() => triggerCancelConfirmation(order.id)}
                                                style={styles.cancelBtn}
                                            >
                                                Cancel Order
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Layout Sheet CSS Matrix 
const styles = {
    container: { background: '#ffffff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '30px' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #f1f3f5', paddingBottom: '15px' },
    panelTitle: { margin: 0, fontSize: '18px', color: '#212529', fontWeight: 'bold' },
    panelSubtitle: { margin: '5px 0 0 0', fontSize: '13px', color: '#6c757d' },
    syncQueueButton: { padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    thRow: { backgroundColor: '#f1f3f5' },
    th: { padding: '12px', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' },
    tr: { borderBottom: '1px solid #dee2e6', transition: 'background-color 0.2s' },
    td: { padding: '14px 12px', color: '#212529', fontSize: '13px', verticalAlign: 'middle' },
    emptyCell: { textAlign: 'center', padding: '30px', color: '#6c757d', fontSize: '14px', fontStyle: 'italic' },
    
    itemsWrapper: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' },
    productBadge: { display: 'inline-flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden', fontSize: '12px' },
    prodName: { padding: '4px 8px', color: '#212529', fontWeight: '500', background: '#e9ecef' },
    prodQty: { padding: '4px 8px', color: '#fff', fontWeight: 'bold', background: '#6c757d' },
    
    pendingBadge: { background: '#fff3cd', color: '#856404', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #ffeeba' },
    actionBtnGroup: { display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' },
    actionBtn: { background: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'background-color 0.2s', whiteSpace: 'nowrap' },
    cancelBtn: { background: '#6c757d', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'background-color 0.2s', whiteSpace: 'nowrap' },
    errorBanner: { padding: '12px', background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', textAlign: 'center' },
    successBanner: { padding: '12px', background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', textAlign: 'center' },
    toast: { position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#28a745', color: '#ffffff', padding: '16px 28px', borderRadius: '6px', boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)', fontSize: '14px', fontWeight: 'bold', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px' },
    toastIcon: { fontSize: '18px' },
    
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
    modalCard: { background: '#ffffff', minWidth: '400px', maxWidth: '600px', borderRadius: '6px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    modalHeader: { background: '#f8d7da', color: '#721c24', padding: '16px 20px', fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid #f5c6cb', textAlign: 'left' },
    modalBody: { padding: '20px', color: '#212529', fontSize: '14px', textAlign: 'left', backgroundColor: '#fff5f5', lineHeight: '1.5' },
    modalFooter: { padding: '12px 20px', background: '#f8f9fa', borderTop: '1px solid #dee2e6', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    modalBtn: { background: '#dc3545', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
    
    // 🎯 NEW DESIGN STYLES FOR THE DISMISS CONFIRMATION BADGE
    confirmCard: { background: '#ffffff', minWidth: '360px', maxWidth: '480px', borderRadius: '8px', boxShadow: '0 12px 30px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    confirmHeader: { background: '#fff3cd', color: '#856404', padding: '16px 20px', fontWeight: 'bold', fontSize: '15px', borderBottom: '1px solid #ffeeba', textAlign: 'left' },
    confirmBody: { padding: '20px 20px 15px 20px', color: '#495057', fontSize: '14px', textAlign: 'left', backgroundColor: '#ffffff', lineHeight: '1.5' },
    discardBtn: { background: '#e9ecef', color: '#495057', border: 'none', padding: '8px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
    confirmBtn: { background: '#856404', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },

    manifestErrorList: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', maxHeight: '250px', overflowY: 'auto' },
    errorItemRow: { background: '#ffffff', border: '1px solid #f5c6cb', borderRadius: '4px', padding: '10px 12px', borderLeft: '4px solid #dc3545', textAlign: 'left' },
    errorSku: { fontSize: '12px', color: '#495057', fontFamily: 'monospace' },
    errorDetail: { fontSize: '13px', color: '#c82333', marginTop: '2px', fontWeight: '500' }
};

export default OrderFulfillment;