import React, { useState } from 'react';

const OrderFulfillment = () => {
    // 🎯 Mock Order Queue Data Engine
    const [orders, setOrders] = useState([
        { id: "ORD-9082", customer: "Amravati Logistics Corp", items: "PROD-SKU-2026 (x5)", date: "2026-06-09", status: "PENDING" },
        { id: "ORD-9083", customer: "Nagpur Tech Retail", items: "TEST-ITEM-99 (x2)", date: "2026-06-09", status: "PENDING" },
        { id: "ORD-9084", customer: "Mumbai Supply Co", items: "BOX-ALPHA-XYZ (x10)", date: "2026-06-08", status: "FULFILLED" }
    ]);

    // Toast Notification State
    const [toastMessage, setToastMessage] = useState('');

    // Handle Order Dispatch Action
    const handleFulfillOrder = (orderId) => {
        // Update the local state array dynamically
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId ? { ...order, status: "FULFILLED" } : order
            )
        );

        // Display a brief, modern auto-vanishing success alert banner
        setToastMessage(`Order ${orderId} successfully dispatched to shipping dock!`);
        setTimeout(() => setToastMessage(''), 3000);
    };

    return (
        <div style={styles.container}>
            {/* Floating Auto-Hide Success Toast */}
            {toastMessage && (
                <div style={styles.toast}>
                    <span style={styles.toastIcon}>📦</span>
                    {toastMessage}
                </div>
            )}

            <div style={styles.panelHeader}>
                <div>
                    <h2 style={styles.panelTitle}>Active Order Fulfillment Center</h2>
                    <p style={styles.panelSubtitle}>Process outbound shipments and update stock matching parameters in real-time.</p>
                </div>
                <div style={styles.badgeCount}>
                    {orders.filter(o => o.status === "PENDING").length} Pending Dispatches
                </div>
            </div>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Order ID</th>
                            <th style={styles.th}>Customer Destination</th>
                            <th style={styles.th}>Requested SKUs & Qty</th>
                            <th style={styles.th}>Order Date</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th, { ...styles.th, textAlign: 'center' }}>Action Gate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} style={styles.tr}>
                                <td style={styles.td}><strong>{order.id}</strong></td>
                                <td style={styles.td}>{order.customer}</td>
                                <td style={styles.td}><code style={styles.code}>{order.items}</code></td>
                                <td style={styles.td}>{order.date}</td>
                                <td style={styles.td}>
                                    <span style={
                                        order.status === 'PENDING' ? styles.statusPending : styles.statusFulfilled
                                    }>
                                        {order.status}
                                    </span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                    {order.status === 'PENDING' ? (
                                        <button 
                                            onClick={() => handleFulfillOrder(order.id)}
                                            style={styles.actionBtn}
                                        >
                                            Dispatch Order
                                        </button>
                                    ) : (
                                        <button style={styles.disabledBtn} disabled>
                                            Completed
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { background: '#ffffff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '30px' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f3f5', paddingBottom: '15px' },
    panelTitle: { margin: 0, fontSize: '20px', color: '#212529', textAlign: 'left' },
    panelSubtitle: { margin: '5px 0 0 0', fontSize: '13px', color: '#6c757d', textAlign: 'left' },
    badgeCount: { background: '#fff3cd', color: '#856404', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #ffeeba' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '12px', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600', fontSize: '14px' },
    tr: { borderBottom: '1px solid #dee2e6', transition: 'background-color 0.2s' },
    td: { padding: '14px 12px', color: '#212529', fontSize: '14px' },
    code: { 
    background: '#f1f3f5',       // Soft, light gray tag background
    color: '#343a40',            // Sharp, readable dark charcoal text
    border: '1px solid #dee2e6', // Subtle gray border line
    
    padding: '4px 8px', 
    borderRadius: '4px', 
    fontFamily: 'Courier New, monospace', 
    fontSize: '13px', 
    fontWeight: 'bold',
    display: 'inline-block'
},
    statusPending: { background: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    statusFulfilled: { background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    actionBtn: { background: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'background 0.2s' },
    disabledBtn: { background: '#e9ecef', color: '#6c757d', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'not-allowed' },
    toast: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#17a2b8', color: '#ffffff', padding: '12px 24px', borderRadius: '50px', boxShadow: '0 4px 15px rgba(23, 162, 184, 0.4)', fontSize: '15px', fontWeight: 'bold', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px' },
    toastIcon: { fontSize: '16px' }
};

export default OrderFulfillment;