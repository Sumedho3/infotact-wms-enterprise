import React, { useState, useEffect } from 'react'; 
import { useAuth } from '../auth/AuthContext';
import axiosClient from '../../api/axiosClient'; 
import BarcodeScanner from './BarcodeScanner';
import OrderFulfillment from './OrderFulfillment';
import AdminManagementConsole from './AdminManagementConsole';
import OrderCreationConsole from './OrderCreationConsole';

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
 * 🎯 INVENTORY STATUS RENDERING
 * Evaluates ONLY the specific inventory line's isolated item volume.
 */
const renderInventoryStatus = (quantity) => {
    if (quantity === undefined || quantity === null || quantity === 0) {
        return <span style={styles.statusBadgeRed}>OUT OF STOCK</span>;
    }
    if (quantity <= 10) {
        return <span style={styles.statusBadgeBlue}>LOW STOCK</span>;
    }
    return <span style={styles.statusBadgeGreen}>OPTIMAL</span>;
};

/**
 * 🎯 STORAGE BIN METRIC STATUS RENDERING
 * Evaluates total physical material allocation across all rows sharing the same space.
 * Automatically flips status to ALMOST FULL when remaining space drops to 10 units or less.
 */
const renderBinStatus = (totalBinStock, maxCapacity = 100) => {
    const spaceRemaining = maxCapacity - totalBinStock;

    if (totalBinStock >= maxCapacity) {
        return <span style={{ ...styles.statusBadgeRed, backgroundColor: '#dc3545', color: '#ffffff', borderColor: '#bd2130' }}>FULL</span>;
    }
    if (spaceRemaining <= 10 && totalBinStock > 0) {
        return <span style={{ ...styles.statusBadgeYellow, backgroundColor: '#ffc107', color: '#212529', borderColor: '#e0a800' }}>ALMOST FULL</span>;
    }
    if (totalBinStock > 0) {
        return <span style={styles.statusBadgeGreen}>OPTIMAL</span>;
    }
    return <span style={{ ...styles.statusBadgeBlue, backgroundColor: '#e9ecef', color: '#495057', borderColor: '#ced4da' }}>EMPTY</span>;
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
    
    // Visibility Control for Out-of-Stock Manifest Modal
    const [exceptionModalOpen, setExceptionModalOpen] = useState(false);

    // Tracking dynamic manual-close inbound overflow popups
    const [receivingErrorVisible, setReceivingErrorVisible] = useState(false);
    const [receivingErrorMessage, setReceivingErrorMessage] = useState('');

    // User Session Profile Context
    const [userProfile, setUserProfile] = useState({
        username: '',
        role: '',
        warehouseLocation: '',
        warehouseId: null
    });

    // Helper utility to calculate total stock volume in a single unique bin
    const getBinTotalStock = (binCode) => {
        if (!binCode) return 0;
        return inventoryItems
            .filter(item => item.storageBin?.binCode === binCode)
            .reduce((sum, item) => sum + (item.quantity || 0), 0);
    };

    // Isolated data-refresh handler for post-transaction mutations
    const refreshInventoryData = async () => {
        try {
            const inventoryResponse = await axiosClient.get('/api/inventory');
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

            // 📍 Locate this section inside initializeDashboardData (around line 97)
		try {
			const profileResponse = await axiosClient.get('/api/users/me');
			console.log("Active Login Data Payload:", profileResponse.data);

			// 🎯 THE MAP REFACTOR: Extract name and location variables cleanly
			const facilityName = profileResponse.data.warehouseName || '';
			const facilityLoc = profileResponse.data.warehouseLocation || '';

			setUserProfile({
				username: profileResponse.data.username,
				role: profileResponse.data.role,
				
				// Assemble the format: Name <Address Location>
				// Fallback safely if a floating administrator doesn't have a linked warehouse row
				warehouseDisplay: facilityName && facilityLoc 
					? `${facilityName} (${facilityLoc})` 
					: facilityLoc || 'Bhiwandi Logistics Hub <Bhiwandi, Mumbai>',
					
				warehouseId: profileResponse.data.warehouseId || profileResponse.data.warehouse_id || null 
			});
		} catch (profileErr) {
			console.error("Critical Profile Sync Failure:", profileErr);
			setUserProfile({
				username: 'Unknown User',
				role: 'UNKNOWN',
				warehouseDisplay: 'Unsynchronized Facility <Global Operational Scope>',
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
            console.error("Failed to process dynamic inventory placement", err);
            await refreshInventoryData(); 
            const backendErrorString = err.response?.data?.error || "Inbound operation encountered a processing exception.";
            setReceivingErrorMessage(backendErrorString);
            setReceivingErrorVisible(true);
        }
    };

    const activeAlertsCount = inventoryItems.filter(item => item.quantity === 0).length;

    return (
        <div style={styles.dashboardContainer}>
            {/* Header Control Strip */}
            <header style={styles.header}>
                <div style={styles.branding}>
                    <h1 style={styles.title}>WMS Enterprise Workspace</h1>
                    <p style={styles.subtitle}>
						Logged in as: <strong>{userProfile.username || 'Syncing...'}</strong> (<span style={styles.roleBadge}>{userProfile.role || 'N/A'}</span>)
						
						{/* 🎯 THE FORMAT UPDATE CELL */}
						<span style={styles.locationBadge}>
							📍 {userProfile.warehouseDisplay || 'Loading Location...'}
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
                    <p style={{ ...styles.metricCount, color: '#28a745' }}>
                        {new Set(inventoryItems.map(item => item.storageBin?.binCode).filter(Boolean)).size} Bins
                    </p>
                </div>

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
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    {/* 🎯 CENTERED TH HEADERS FOR TARGETED COLUMNS */}
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Product ID</th>
                                    <th style={styles.th}>SKU Code</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Storage Bin ID</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Warehouse ID</th>
                                    <th style={styles.th}>Bin Location</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Current Stock</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Inventory Status</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Space Remaining</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Storage Bin Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ ...styles.td, textAlign: 'center', color: '#6c757d' }}>
                                            No active inventory entries found in database records.
                                        </td>
                                    </tr>
                                ) : (
                                    inventoryItems.map((item) => {
                                        const totalBinStock = getBinTotalStock(item.storageBin?.binCode);
                                        const spaceRemaining = Math.max(0, 100 - totalBinStock);
                                        const displayWarehouseId = item.storageBin?.warehouseId || 'N/A';

                                        return (
                                            <tr key={item.id} style={styles.tr}>
                                                {/* 🎯 CENTERED DATA CELLS FOR THE REQUESTED PARAMETERS */}
                                                <td style={{ ...styles.td, textAlign: 'center', color: '#6c757d' }}>
                                                    {item.product?.id || 'N/A'}
                                                </td>
                                                <td style={styles.td}>
                                                    <strong style={{ fontFamily: 'Courier New, monospace' }}>
                                                        {item.product?.sku || 'N/A'}
                                                    </strong>
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#495057' }}>
                                                    {item.storageBin?.id ? `#${item.storageBin.id}` : 'N/A'}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#495057' }}>
                                                    {displayWarehouseId}
                                                </td>
                                                <td style={styles.td}>
                                                    {formatBinLocation(item.storageBin?.binCode)}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                                    {item.quantity !== undefined ? `${item.quantity} Units` : '0 Units'}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                                    {renderInventoryStatus(item.quantity)}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center', fontWeight: '600', color: spaceRemaining === 0 ? '#dc3545' : '#28a745' }}>
                                                    {spaceRemaining} Units
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                                    {renderBinStatus(totalBinStock)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
			
			<OrderCreationConsole onOrderStagedSuccessfully={refreshInventoryData} />
            
            <OrderFulfillment 
				onOrderPacked={refreshInventoryData} 
				userProfile={userProfile} 
			/>

            {userProfile.role === 'ADMIN' && (
                <AdminManagementConsole onConfigurationChanged={refreshInventoryData} />
				)
			}

            {/* POP-UP MODAL OVERLAY */}
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

            {/* POP-UP OVERLAY */}
            {receivingErrorVisible && (
                <div style={inlineModalStyles.overlay}>
                    <div style={inlineModalStyles.card}>
                        <div style={inlineModalStyles.header}>
                            ⚠️ Inbound Processing Alert
                        </div>
                        <div style={inlineModalStyles.body}>
                            {receivingErrorMessage}
                        </div>
                        <div style={inlineModalStyles.footer}>
                            <button 
                                type="button" 
                                onClick={() => setReceivingErrorVisible(false)}
                                style={inlineModalStyles.okBtn}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Style Sheets Context Matrix
const styles = {
    dashboardContainer: { padding: '30px', maxWidth: '100%', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', boxSizing: 'border-box' },
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
    th: { padding: '12px', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' },
    tr: { borderBottom: '1px solid #dee2e6', transition: 'background-color 0.2s' },
    td: { padding: '14px 12px', color: '#212529', fontSize: '13px' },
    statusBadgeGreen: { background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #c3e6cb', display: 'inline-block' },
    statusBadgeBlue: { background: '#e8f0fe', color: '#1a73e8', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #b1d4fe', display: 'inline-block' },
	statusBadgeRed: { background: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #f5c6cb', display: 'inline-block' },
	statusBadgeYellow: { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #ffeeba', display: 'inline-block' },
    loadingText: { padding: '30px', textAlign: 'center', color: '#007bff', fontWeight: 'bold', fontSize: '15px' },
    errorText: { padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #f5c6cb' }
};

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

const inlineModalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 12000 },
    card: { background: '#ffffff', minWidth: '380px', maxWidth: '520px', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    header: { background: '#fff3cd', color: '#856404', padding: '16px 20px', fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid #ffeeba', textAlign: 'left' },
    body: { padding: '22px 20px', color: '#721c24', fontSize: '14px', textAlign: 'left', backgroundColor: '#fffdf5', lineHeight: '1.5', fontWeight: '500' },
    footer: { padding: '12px 20px', background: '#f8f9fa', borderTop: '1px solid #dee2e6', display: 'flex', justifyContent: 'flex-end' },
    okBtn: { background: '#856404', color: '#ffffff', border: 'none', padding: '8px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }
};

export default WarehouseDashboard;