import React, { useState, useEffect } from 'react'; 
import { useAuth } from '../auth/AuthContext';
import axiosClient from '../../api/axiosClient'; 
import BarcodeScanner from './BarcodeScanner';
import OrderFulfillment from './OrderFulfillment';

/**
 * Dynamic Location Formatter
 * Takes a raw backend string like "ZONE-GROCERY-ROW-3-BIN-12"
 * and splits it into a structured operational layout.
 */
const formatBinLocation = (binCode) => {
    if (!binCode) return 'Unassigned';

    const segments = binCode.split('-'); 

    if (segments.length < 6) return binCode;

    const zone = segments[1]; 
    const row = segments[3];  
    const bin = segments[5];  

    return (
        <div style={{ textAlign: 'left', fontSize: '13px', lineHeight: '1.4' }}>
            <div><strong>Zone:</strong> {zone}</div>
            <div><strong>Row:</strong> {row}</div>
            <div><strong>Bin No:</strong> {bin}</div>
        </div>
    );
};

/**
 * WarehouseDashboard Component
 * Provides a production-grade operational layout workspace for tracking inventory metrics.
 */
const WarehouseDashboard = () => {
    const { logoutService } = useAuth();

    // Inventory & Data States
    const [inventoryItems, setInventoryItems] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0); 
    const [loading, setLoading] = useState(true);          
    const [fetchError, setFetchError] = useState('');      
    
    // 🎯 NEW STATE: Dynamic Visibility Control for Out-of-Stock Manifest Modal
    const [exceptionModalOpen, setExceptionModalOpen] = useState(false);

    // Strict initialization with empty values (Zero Hardcoding)
    const [userProfile, setUserProfile] = useState({
        username: '',
        role: '',
        warehouseLocation: '',
        warehouseId: null
    });

    // Isolated data-refresh handler for post-transaction mutations
    const refreshInventoryData = async () => {
        try {
            const inventoryResponse = await axiosClient.get('/api/inventory');
            
            // Explicitly sort live database records by Inventory Item ID Ascending
            const sortedItems = inventoryResponse.data.sort((a, b) => a.id - b.id);
            
            setInventoryItems(sortedItems);
            setTotalProducts(sortedItems.length); 
            setFetchError('');
        } catch (inventoryErr) {
            console.error("Failed to load database stocks:", inventoryErr);
            setFetchError('Failed to synchronize inventory data with server.');
        }
    };

    useEffect(() => {
        const initializeDashboardData = async () => {
            setLoading(true);
            setFetchError('');

            try {
				const profileResponse = await axiosClient.get('/api/users/me');
				console.log("Active Login Data Payload:", profileResponse.data);

				setUserProfile({
					username: profileResponse.data.username,
					role: profileResponse.data.role,
					warehouseLocation: profileResponse.data.warehouseLocation || 'Bhiwandi, Mumbai',
					warehouseId: profileResponse.data.warehouseId || profileResponse.data.warehouse_id || 1 
				});
			} catch (profileErr) {
				console.error("Critical Profile Sync Failure:", profileErr);
				setUserProfile({
					username: 'Unknown User',
					role: 'UNKNOWN',
					warehouseLocation: 'Unsynchronized Facility',
					warehouseId: null
				});
				setFetchError('Unable to verify user session profile assignment parameters.');
			}

            await refreshInventoryData();
            setLoading(false);
        };

        initializeDashboardData();
    }, []);

    const handleProcessInventoryPlacement = async (transferredSku, targetQuantity) => {
        if (!userProfile.warehouseId) {
            alert("Operational Error: Inventory placement denied. Missing verified warehouse assignment ID.");
            return;
        }

        const matchedStockRecord = inventoryItems.find(
            item => item.product?.sku?.toUpperCase() === transferredSku.trim().toUpperCase()
        );

        if (!matchedStockRecord) {
            alert(`Operational Error: SKU "${transferredSku}" does not exist in your database product definitions!`);
            return;
        }

        const receivingPayload = {
            productId: matchedStockRecord.product.id,  
            quantity: parseInt(targetQuantity, 10),        
            warehouseId: userProfile.warehouseId       
        };

        try {
            await axiosClient.post('/api/receiving/process', receivingPayload);
            await refreshInventoryData();
        } catch (err) {
            console.error("Failed to process dynamic inventory placement operation:", err);
        }
    };

    // Calculate active exceptions count (items running completely out of stock)
    const activeAlertsCount = inventoryItems.filter(item => item.quantity === 0).length;

    return (
        <div style={styles.dashboardContainer}>
            {/* Header Control Strip */}
            <header style={styles.header}>
                <div style={styles.branding}>
                    <h1 style={styles.title}>WMS Enterprise Workspace</h1>
                    <p style={styles.subtitle}>
                        Logged in as: <strong>{userProfile.username || 'Syncing...'}</strong> (<span style={styles.roleBadge}>{userProfile.role || 'N/A'}</span>)
                        <span style={styles.locationBadge}>
                            📍 {userProfile.warehouseLocation || 'Loading Location...'}
                        </span>
                    </p>
                </div>
                <button onClick={logoutService} style={styles.logoutBtn}>
                    Secure Log Out
                </button>
            </header>

            <BarcodeScanner 
                onTransferToDock={handleProcessInventoryPlacement} 
                activeWarehouseLocation={userProfile.warehouseLocation}
            />

            {/* Metrics Counter Rows */}
            <section style={styles.metricsGrid}>
                <div style={styles.metricCard}>
                    <h3 style={styles.metricLabel}>Total Allocated Stocks</h3>
                    <p style={{ ...styles.metricCount, color: '#007bff' }}>{totalProducts.toLocaleString()}</p>
                </div>
                
                <div style={styles.metricCard}>
                    <h3 style={styles.metricLabel}>Active Storage Bins</h3>
                    <p style={{ ...styles.metricCount, color: '#28a745' }}>{inventoryItems.length} Bins</p>
                </div>

                {/* 🎯 REFACTOR 2: Interactive, Clickable Exceptions Center Card with State-Driven Styles */}
                <div 
                    onClick={() => {
                        if (activeAlertsCount > 0) {
                            setExceptionModalOpen(true);
                        }
                    }}
                    style={{
                        ...styles.metricCard,
                        borderLeft: activeAlertsCount > 0 ? '5px solid #dc3545' : '5px solid #28a745',
                        cursor: activeAlertsCount > 0 ? 'pointer' : 'default',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        if (activeAlertsCount > 0) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }}
                >
                    <h3 style={styles.metricLabel}>Fulfillment Exceptions</h3>
                    <p style={{ 
                        ...styles.metricCount, 
                        color: activeAlertsCount > 0 ? '#dc3545' : '#28a745' 
                    }}>
                        {activeAlertsCount > 0 ? `${activeAlertsCount} Empty Bin Alert` : '0 Exceptions Active'}
                    </p>
                    {activeAlertsCount > 0 && (
                        <span style={styles.exploreLink}>
                            Click to view discrepancies 🔍
                        </span>
                    )}
                </div>
            </section>

            {/* Main Operational Data Panel */}
            <section style={styles.tableSection}>
                <div style={styles.panelHeader}>
                    <h2 style={styles.sectionTitle}>Real-Time Inventory Status (PostgreSQL Synchronized)</h2>
                    <div style={{ ...styles.statusDot, backgroundColor: fetchError ? '#dc3545' : '#28a745' }}></div>
                </div>

                {fetchError && <div style={styles.errorText}>{fetchError}</div>}
                
                {loading ? (
                    <div style={styles.loadingText}>Fetching database state rows...</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Inventory ID</th> 
                                <th style={styles.th}>Product ID</th>
                                <th style={styles.th}>SKU Code</th>
                                <th style={styles.th}>Bin Location</th>
                                <th style={styles.th}>Current Stock</th>
                                <th style={styles.th}>Fulfillment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#6c757d' }}>
                                        No active inventory entries found in database records.
                                    </td>
                                </tr>
                            ) : (
                                inventoryItems.map((item) => (
                                    <tr key={item.id} style={styles.tr}>
                                        <td style={styles.td}>#{item.id}</td>
                                        <td style={{ ...styles.td, color: '#6c757d' }}>
                                            {item.product?.id || 'N/A'}
                                        </td>
                                        <td style={styles.td}>
                                            <strong style={{ fontFamily: 'Courier New, monospace' }}>
                                                {item.product?.sku || 'N/A'}
                                            </strong>
                                        </td>
                                        <td style={styles.td}>
                                            formatBinLocation(item.storageBin?.binCode)
                                        </td>
                                        <td style={styles.td}>
                                            {item.quantity !== undefined ? `${item.quantity} Units` : '0 Units'}
                                        </td>
                                        <td style={styles.td}>
											<span style={
												item.quantity === 0 
													? styles.statusBadgeRed 
													: item.quantity > 10 
														? styles.statusBadgeGreen 
														: styles.statusBadgeBlue
											}>
												{item.quantity === 0 
													? 'OUT OF STOCK' 
													: item.quantity > 10 
														? 'OPTIMAL' 
														: 'LOW STOCK'
												}
											</span>
										</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </section>
            
            <OrderFulfillment 
				onOrderPacked={refreshInventoryData} 
				userProfile={userProfile} 
			/>

            {/* 🎯 NEW DESCRIPTIVE POP-UP MODAL OVERLAY: Lists comprehensive depletion metadata records */}
            {exceptionModalOpen && (
                <div style={dashboardModalStyles.overlay}>
                    <div style={dashboardModalStyles.card}>
                        <div style={dashboardModalStyles.header}>
                            🚨 Warehouse Operational Exceptions Manifest
                        </div>
                        <div style={dashboardModalStyles.body}>
                            <p style={{ margin: '0 0 18px 0', fontSize: '14px', color: '#495057', lineHeight: '1.5' }}>
                                The following item catalog rows have run completely out of stock inside PostgreSQL. Outstanding outbound order fulfillment operations for these items will be rejected by the server until replenishment barcodes are processed.
                            </p>
                            <div style={dashboardModalStyles.listContainer}>
                                {inventoryItems.filter(item => item.quantity === 0).map((item) => (
                                    <div key={item.id} style={dashboardModalStyles.errorRow}>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#212529' }}>
                                            Inventory Registry Record #{item.id}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '3px' }}>
                                            Product ID: <span style={{ color: '#212529', fontWeight: '600' }}>#{item.product?.id || 'N/A'}</span> | 
                                            SKU Target: <span style={{ fontFamily: 'monospace', color: '#007bff', fontWeight: 'bold' }}>{item.product?.sku || 'N/A'}</span>
                                        </div>
                                        {item.storageBin?.binCode && (
                                            <div style={{ fontSize: '12px', color: '#495057', marginTop: '4px', background: '#e9ecef', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', alignSelf: 'flex-start' }}>
                                                📍 <strong>Depleted Location:</strong> {item.storageBin.binCode}
                                            </div>
                                        )}
                                        <div style={dashboardModalStyles.dangerBadge}>0 Units on Shelves</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={dashboardModalStyles.footer}>
                            <button 
                                type="button" 
                                onClick={() => setExceptionModalOpen(false)}
                                style={dashboardModalStyles.closeBtn}
                            >
                                Acknowledge & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Original Base Core Style Sheets Context Matrix
const styles = {
    dashboardContainer: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', boxSizing: 'border-box' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e9ecef', paddingBottom: '20px', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' },
    branding: { textAlign: 'left' },
    title: { margin: 0, fontSize: '28px', color: '#212529' },
    subtitle: { margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }, 
    roleBadge: { color: '#495057', fontWeight: 'bold' },
    locationBadge: { backgroundColor: '#e9ecef', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: '#495057', fontWeight: '500' },
    logoutBtn: { padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' },
    metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' },
    metricCard: { background: '#fff', padding: '20px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'left', borderLeft: '5px solid #dee2e6' },
    metricLabel: { margin: 0, fontSize: '14px', color: '#6c757d', textTransform: 'uppercase' },
    metricCount: { margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold' },
    exploreLink: { fontSize: '11px', color: '#dc3545', fontWeight: 'bold', textDecoration: 'underline', marginTop: '8px', display: 'inline-block' },
    tableSection: { background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    panelHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px' },
    sectionTitle: { margin: 0, fontSize: '18px', color: '#212529', fontWeight: 'bold' }, 
    statusDot: { width: '10px', height: '10px', borderRadius: '50%' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: '#f1f3f5' },
    th: { padding: '12px', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600', fontSize: '14px' },
    tr: { borderBottom: '1px solid #dee2e6', transition: 'background-color 0.2s' },
    td: { padding: '14px 12px', color: '#212529', fontSize: '14px' },
    statusBadgeGreen: { background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    statusBadgeBlue: { background: '#e8f0fe', color: '#1a73e8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
	statusBadgeRed: { background: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #f5c6cb' },
    loadingText: { padding: '30px', textAlign: 'center', color: '#007bff', fontWeight: 'bold', fontSize: '15px' },
    errorText: { padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #f5c6cb' }
};

// 🎯 NEW STYLES: Dedicated Modal Overlay Styles CSS Matrix
const dashboardModalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 11000 },
    card: { background: '#ffffff', width: '90%', maxWidth: '550px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    header: { background: '#dc3545', color: '#ffffff', padding: '18px 20px', fontWeight: 'bold', fontSize: '16px', letterSpacing: '0.5px', textAlign: 'left' },
    body: { padding: '20px', backgroundColor: '#ffffff', maxHeight: '400px', overflowY: 'auto' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
    errorRow: { padding: '12px 15px', backgroundColor: '#fff5f5', borderLeft: '4px solid #dc3545', borderRadius: '4px', display: 'flex', flexDirection: 'column', position: 'relative', textAlign: 'left' },
    dangerBadge: { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #f5c6cb' },
    footer: { padding: '14px 20px', background: '#f8f9fa', borderTop: '1px solid #dee2e6', display: 'flex', justifyContent: 'flex-end' },
    closeBtn: { background: '#dc3545', color: '#ffffff', border: 'none', padding: '9px 22px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'background-color 0.2s' }
};

export default WarehouseDashboard;