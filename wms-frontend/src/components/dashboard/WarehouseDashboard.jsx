import React, { useState } from 'react'; // 👈 MODIFICATION 1: Bring in useState for dynamic data updates
import { useAuth } from '../auth/AuthContext';
import BarcodeScanner from './BarcodeScanner'; // 👈 MODIFICATION 2: Import your fresh scanning engine

/**
 * WarehouseDashboard Component
 * Provides a production-grade operational layout workspace for tracking inventory metrics.
 */
const WarehouseDashboard = () => {
    const { user, logoutService } = useAuth();

    // 👈 MODIFICATION 3: Convert the mock table records into a dynamic state array
    const [inventoryItems, setInventoryItems] = useState([
        { id: 1001, sku: 'PROD-SKU-2026', bin: 'BIN-A (Row 4)', qty: '15 Units', status: 'OPTIMAL' },
        { id: 1002, sku: 'PROD-SKU-2026', bin: 'BIN-B (Row 4)', qty: '10 Units', status: 'OPTIMAL' }
    ]);

    // 👈 MODIFICATION 4: Convert your layout counter into a state integer
    const [totalProducts, setTotalProducts] = useState(1240);

    // 👈 MODIFICATION 5: Add the processing callback to catch laser-scanned data tokens
    const handleBarcodeDetected = (scannedSku) => {
        const scannedRowBlueprint = {
            id: Math.floor(Math.random() * 9000) + 1000, // Generate a random matching 4-digit product ID
            sku: scannedSku,
            bin: 'BIN-RECEIVING (Dock 1)',
            qty: '1 Unit',
            status: 'NEW INTAKE'
        };

        // Prepend the new scanned item directly to the top of our table list
        setInventoryItems(prevItems => [scannedRowBlueprint, ...prevItems]);
        
        // Increment our warehouse metrics counter panel
        setTotalProducts(prevCount => prevCount + 1);
    };

    return (
        <div style={styles.dashboardContainer}>
            {/* Header Control Strip */}
            <header style={styles.header}>
                <div style={styles.branding}>
                    <h1 style={styles.title}>WMS Enterprise Workspace</h1>
                    <p style={styles.subtitle}>Logged in as: <strong>{user?.username}</strong> (<span style={styles.roleBadge}>{user?.role}</span>)</p>
                </div>
                <button onClick={logoutService} style={styles.logoutBtn}>
                    Secure Log Out
                </button>
            </header>

            {/* 👈 MODIFICATION 6: Mount the hardware interceptor engine right above your metrics panel */}
            <BarcodeScanner onScanSuccess={handleBarcodeDetected} />

            {/* Metrics Counter Rows */}
            <section style={styles.metricsGrid}>
                <div style={styles.metricCard}>
                    <h3 style={styles.metricLabel}>Total Tracked Products</h3>
                    {/* Render your dynamic state counter */}
                    <p style={{ ...styles.metricCount, color: '#007bff' }}>{totalProducts.toLocaleString()}</p>
                </div>
                <div style={styles.metricCard}>
                    <h3 style={styles.metricLabel}>Active Storage Bins</h3>
                    {/* Render your dynamic array length tracking row layout */}
                    <p style={{ ...styles.metricCount, color: '#28a745' }}>{inventoryItems.length} Bins</p>
                </div>
                <div style={styles.metricCard}>
                    <h3 style={styles.metricLabel}>Fulfillment Exceptions</h3>
                    <p style={{ ...styles.metricCount, color: '#dc3545' }}>0 Alerts</p>
                </div>
            </section>

            {/* Main Operational Data Panel Mockup */}
            <section style={styles.tableSection}>
                <div style={styles.panelHeader}>
                    <h2>Real-Time Inventory Status (PostgreSQL Synchronized)</h2>
                    <div style={styles.statusDot}></div>
                </div>
                
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Product ID</th>
                            <th style={styles.th}>SKU Code</th>
                            <th style={styles.th}>Bin Location</th>
                            <th style={styles.th}>Current Stock</th>
                            <th style={styles.th}>Fulfillment Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 👈 MODIFICATION 7: Map across state array entries dynamically instead of using hardcoded rows */}
                        {inventoryItems.map((item) => (
                            <tr key={item.id} style={styles.tr}>
                                <td style={styles.td}>{item.id}</td>
                                <td style={styles.td}><strong>{item.sku}</strong></td>
                                <td style={styles.td}>{item.bin}</td>
                                <td style={styles.td}>{item.qty}</td>
                                <td style={styles.td}>
                                    <span style={
                                        item.status === 'OPTIMAL' ? styles.statusBadgeGreen : styles.statusBadgeBlue
                                    }>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

const styles = {
    dashboardContainer: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', boxSizing: 'border-box' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e9ecef', paddingBottom: '20px', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' },
    branding: { textAlign: 'left' },
    title: { margin: 0, fontSize: '28px', color: '#212529' },
    subtitle: { margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' },
    roleBadge: { color: '#495057', fontWeight: 'bold' },
    logoutBtn: { padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' },
    metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' },
    metricCard: { background: '#fff', padding: '20px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'left', borderLeft: '5px solid #dee2e6' },
    metricLabel: { margin: 0, fontSize: '14px', color: '#6c757d', textTransform: 'uppercase' },
    metricCount: { margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold' },
    tableSection: { background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    panelHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px' },
    statusDot: { width: '10px', height: '10px', backgroundColor: '#28a745', borderRadius: '50%' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: '#f1f3f5' },
    th: { padding: '12px', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600', fontSize: '14px' },
    tr: { borderBottom: '1px solid #dee2e6', transition: 'background-color 0.2s' },
    td: { padding: '14px 12px', color: '#212529', fontSize: '14px' },
    statusBadgeGreen: { background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    statusBadgeBlue: { background: '#e8f0fe', color: '#1a73e8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' } // Added style for scanned rows
};

export default WarehouseDashboard;