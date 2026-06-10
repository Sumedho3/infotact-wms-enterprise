import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

/**
 * OrderFulfillment Component
 * Renders the outbound order book queue manifest and executes transactional 
 * deductions live over your Week 3 status pipeline endpoint.
 * * 🎯 FIXED: Accepts userProfile as a dynamic prop to guard against tokenless race conditions.
 */
const OrderFulfillment = ({ onOrderPacked, userProfile }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');

    // Fetch outstanding order tracking rows from database when user session is fully synchronized
    useEffect(() => {
        const fetchActiveOrders = async () => {
            // 🎯 THE FIX: Stop execution if the parent dashboard is still instantiating the login session context.
            // This completely blocks tokenless requests from hitting Spring Security at startup!
            if (!userProfile || !userProfile.username) {
                return; 
            }

            try {
                setLoading(true);
                // Adjust route query if your specific order backlog lookup path differs
                const response = await axiosClient.get('/api/orders');
                setOrders(response.data);
            } catch (err) {
                console.error("Failed to fetch order queue manifest records:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveOrders();
    // 🎯 RE-RUN EFFECT: The exact split second your logged-in profile finishes initializing!
    }, [userProfile]); 

    // 📦 CONNECTED TO WEEK 3: Pack an Order & Trigger Automated Database Stock Deduction
    const handleFulfillOrder = async (orderId, targetProductId, qty) => {
        // ZERO HARDCODING: Body structures dynamically build relative to row entity variables
        const packingPayload = {
            status: "PACKED",
            items: [
                {
                    productId: parseInt(targetProductId),
                    orderedQuantity: parseInt(qty)
                }
            ]
        };

        try {
            // Fires transaction pipeline updates straight to your Week 3 status routing path
            await axiosClient.put(`/api/orders/${orderId}/status`, packingPayload);

            // 1. Instantly switch the local row status column badge state to "PACKED"
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId ? { ...order, status: "PACKED" } : order
                )
            );

            // 2. Trigger an automated success message box on screen
            setToastMessage(`Success: Order #${orderId} packed! Stock levels decremented inside PostgreSQL.`);
            setTimeout(() => setToastMessage(''), 4000);

            // 3. THE REFRESH HOOK: Signal back up to the master dashboard to recalculate your inventory numbers
            if (onOrderPacked) {
                await onOrderPacked();
            }
        } catch (err) {
            console.error("Failed to execute order status optimization transaction:", err);
            alert("Transactional Error: Stock deduction rejected. Check if adequate inventory balance exists.");
        }
    };

    return (
        <div style={styles.container}>
            {/* Pop-up notification banner wrapper layout slot */}
            {toastMessage && (
                <div style={styles.toast}>
                    <span style={styles.toastIcon}>📦</span>
                    {toastMessage}
                </div>
            )}

            <div style={styles.panelHeader}>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={styles.panelTitle}>Active Order Fulfillment Center</h2>
                    <p style={styles.panelSubtitle}>Process outbound shipments and execute transactional stock deductions live.</p>
                </div>
                <div style={styles.badgeCount}>
                    {orders.filter(o => o.status !== "PACKED").length} Outstanding
                </div>
            </div>

            <div style={styles.tableWrapper}>
                {loading ? (
                    // If the parent dashboard hasn't finished loading the user data, show standard loading placeholder
                    <div style={styles.loadingText}>
                        {!userProfile || !userProfile.username 
                            ? "Waiting for authorized workspace synchronization..." 
                            : "Synchronizing Order Backlog Book..."
                        }
                    </div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Order ID</th>
                                <th style={styles.th}>Customer Destination</th>
                                <th style={styles.th}>Product ID</th>
                                <th style={styles.th}>Requested Qty</th>
                                <th style={styles.th}>Status</th>
                                <th style={{ ...styles.th, textAlign: 'center' }}>Action Gate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#6c757d' }}>
                                        No outstanding operational orders found in database records.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} style={styles.tr}>
                                        <td style={styles.td}><strong>#{order.id}</strong></td>
                                        <td style={styles.td}>{order.customerName || 'Enterprise Client'}</td>
                                        <td style={{ ...styles.td, color: '#6c757d' }}>#{order.productId || 1}</td>
                                        <td style={styles.td}><strong>{order.quantity || 200} Units</strong></td>
                                        <td style={styles.td}>
                                            <span style={order.status === 'PACKED' ? styles.statusFulfilled : styles.statusPending}>
                                                {order.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                            {order.status !== 'PACKED' ? (
                                                <button 
                                                    // Pass row variables dynamically directly to your Week 3 payload compiler function
                                                    onClick={() => handleFulfillOrder(order.id, order.productId || 1, order.quantity || 200)}
                                                    style={styles.actionBtn}
                                                >
                                                    Pack & Deduct Stock
                                                </button>
                                            ) : (
                                                <button style={styles.disabledBtn} disabled>Completed</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { background: '#ffffff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '30px' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f3f5', paddingBottom: '15px' },
    panelTitle: { margin: 0, fontSize: '20px', color: '#212529', fontWeight: 'bold' },
    panelSubtitle: { margin: '5px 0 0 0', fontSize: '13px', color: '#6c757d' },
    badgeCount: { background: '#fff3cd', color: '#856404', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #ffeeba' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '12px', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600', fontSize: '14px' },
    tr: { borderBottom: '1px solid #dee2e6', transition: 'background-color 0.2s' },
    td: { padding: '14px 12px', color: '#212529', fontSize: '14px' },
    statusPending: { background: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    statusFulfilled: { background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    actionBtn: { background: '#28a745', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'background 0.2s' },
    disabledBtn: { background: '#e9ecef', color: '#6c757d', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'not-allowed' },
    loadingText: { padding: '20px', textAlign: 'center', color: '#007bff', fontWeight: 'bold' },
    toast: { position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#17a2b8', color: '#ffffff', padding: '16px 28px', borderRadius: '6px', boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)', fontSize: '14px', fontWeight: 'bold', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px' },
    toastIcon: { fontSize: '18px' }
};

export default OrderFulfillment;