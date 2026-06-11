import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AdminManagementConsole = ({ onConfigurationChanged }) => {
    const [activeTab, setActiveTab] = useState('warehouse');
    const [statusMessage, setStatusMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(true);

    // Relational Lookup Arrays
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [storageBins, setStorageBins] = useState([]);

    // 1. Form States - Rigorously initialized with empty string parameters
    const [warehouseForm, setWarehouseForm] = useState({ name: '', location: '' });
    const [productForm, setProductForm] = useState({ sku: '', name: '', description: '', category: '' });
    const [binForm, setBinForm] = useState({ zone: '', rowNum: '', binNum: '', allowedCategory: '', warehouseId: '' });
    const [userForm, setUserForm] = useState({ username: '', password: '', role: '', warehouseId: '' });
    
    // 🎯 NEW STATE: Dynamic Inventory Form context matching Postman Contract schema
    const [inventoryForm, setInventoryForm] = useState({ quantity: '', productId: '', storageBinId: '' });

    // Fetch relational dependencies from PostgreSQL based on active visibility
    const fetchDropdownData = async () => {
        try {
            if (activeTab === 'storagebin' || activeTab === 'user' || activeTab === 'inventory') {
                const res = await axiosClient.get('/api/warehouses');
                setWarehouses(res.data);
            }
            if (activeTab === 'inventory') {
                // Fetch product catalog rows dynamically
                const prodRes = await axiosClient.get('/api/products');
                setProducts(prodRes.data);

                // Fetch storage bin mapping specifications dynamically
                // (Using /api/bins as confirmed by your previous Postman path rules)
                const binRes = await axiosClient.get('/api/bins');
                setStorageBins(binRes.data);
            }
        } catch (err) {
            console.error("Failed to synchronize relational configuration parameters", err);
        }
    };

    useEffect(() => {
        fetchDropdownData();
    }, [activeTab]);

    const triggerNotification = (msg, successFlag) => {
        setStatusMessage(msg);
        setIsSuccess(successFlag);
        setTimeout(() => setStatusMessage(''), 4500);
    };

    // 2. Action Submission Interceptors
    const handleCreateWarehouse = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/api/warehouses', warehouseForm);
            triggerNotification("🏬 New Warehouse registered successfully into configuration records!", true);
            setWarehouseForm({ name: '', location: '' });
        } catch (err) {
            triggerNotification(err.response?.data?.error || "Failed to create warehouse record.", false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/api/products', productForm);
            triggerNotification("📦 Product definition added cleanly to master catalog registry!", true);
            setProductForm({ sku: '', name: '', description: '', category: '' });
            if (onConfigurationChanged) onConfigurationChanged();
        } catch (err) {
            triggerNotification(err.response?.data?.error || "Failed to instantiate product definition.", false);
        }
    };

    const handleCreateBin = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/api/bins', {
                zone: binForm.zone,
                rowNum: parseInt(binForm.rowNum, 10),
                binNum: parseInt(binForm.binNum, 10),
                allowedCategory: binForm.allowedCategory,
                warehouseId: parseInt(binForm.warehouseId, 10)
            });
            triggerNotification("🗄️ Storage Bin allocated and linked to selected warehouse successfully!", true);
            setBinForm({ zone: '', rowNum: '', binNum: '', allowedCategory: '', warehouseId: '' });
            if (onConfigurationChanged) onConfigurationChanged();
        } catch (err) {
            triggerNotification(err.response?.data?.error || "Failed to mount storage bin layout.", false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/api/auth/register', {
                username: userForm.username,
                password: userForm.password,
                role: userForm.role,
                warehouseId: parseInt(userForm.warehouseId, 10)
            });
            triggerNotification(`👤 User profile created successfully for role authority: [${userForm.role}]`, true);
            setUserForm({ username: '', password: '', role: '', warehouseId: '' });
        } catch (err) {
            triggerNotification(err.response?.data?.error || "Failed to register system profile entry.", false);
        }
    };

    // 🎯 NEW TRANSACTION HANDLER: Dispatches inventory initialization models matching Postman body
    const handleCreateInventory = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/api/inventory', {
                quantity: parseInt(inventoryForm.quantity, 10),
                productId: parseInt(inventoryForm.productId, 10),
                storageBinId: parseInt(inventoryForm.storageBinId, 10)
            });
            triggerNotification("⚖️ Initial stock allocation mounted and locked inside PostgreSQL rows successfully!", true);
            setInventoryForm({ quantity: '', productId: '', storageBinId: '' });
            if (onConfigurationChanged) onConfigurationChanged(); // Re-render main table rows immediately!
        } catch (err) {
            triggerNotification(err.response?.data?.error || "Failed to instantiate inventory registry block.", false);
        }
    };

    return (
        <div style={styles.consoleContainer}>
            <h2 style={styles.consoleTitle}>Week 1 Framework & Infrastructure Manager</h2>
            <p style={styles.consoleSubtitle}>Allocate core database physical assets and provision credential profiles across facility boundaries.</p>

            {statusMessage && (
                <div style={{ ...styles.alertBanner, backgroundColor: isSuccess ? '#d4edda' : '#f8d7da', color: isSuccess ? '#155724' : '#721c24', border: isSuccess ? '1px solid #c3e6cb' : '1px solid #f5c6cb' }}>
                    {statusMessage}
                </div>
            )}

            {/* Tab Controller Bar - Added Inventory Selector */}
            <div style={styles.tabBar}>
                {['warehouse', 'product', 'storagebin', 'inventory', 'user'].map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        style={{ ...styles.tabBtn, backgroundColor: activeTab === tab ? '#007bff' : '#e9ecef', color: activeTab === tab ? '#ffffff' : '#495057' }}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Dynamic Core Forms Workspace */}
            <div style={styles.formContainer}>
                {activeTab === 'warehouse' && (
                    <form onSubmit={handleCreateWarehouse} style={styles.verticalForm}>
                        <h3>Provision New Warehouse Location</h3>
                        <label style={styles.fieldLabel}>Facility Branding Title:</label>
                        <input type="text" placeholder="e.g., Bhiwandi Logistics Hub" value={warehouseForm.name} onChange={e => setWarehouseForm({ ...warehouseForm, name: e.target.value })} style={styles.inputField} required />
                        <label style={styles.fieldLabel}>Geographic Region Coordinates:</label>
                        <input type="text" placeholder="e.g., Mumbai, MH" value={warehouseForm.location} onChange={e => setWarehouseForm({ ...warehouseForm, location: e.target.value })} style={styles.inputField} required />
                        <button type="submit" style={styles.submitBtn}>Deploy Warehouse Entity</button>
                    </form>
                )}

                {activeTab === 'product' && (
                    <form onSubmit={handleCreateProduct} style={styles.verticalForm}>
                        <h3>Register Master Catalog Item</h3>
                        <label style={styles.fieldLabel}>Unique SKU Code Reference:</label>
                        <input type="text" placeholder="e.g., LAP-DL-XPS15" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })} style={styles.inputField} required />
                        <label style={styles.fieldLabel}>Commercial Product Name:</label>
                        <input type="text" placeholder="e.g., Dell XPS 15 Laptop" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={styles.inputField} required />
                        <label style={styles.fieldLabel}>Item Inventory Group Classification:</label>
                        <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} style={styles.inputField} required>
                            <option value="" disabled style={{ color: '#6c757d' }}>-- Select Category --</option>
                            <option value="ELECTRONICS">ELECTRONICS</option>
                            <option value="GROCERY">GROCERY</option>
                            <option value="APPAREL">APPAREL</option>
                        </select>
                        <label style={styles.fieldLabel}>Functional Product Specification Description:</label>
                        <input type="text" placeholder="Technical specifications detail attributes..." value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} style={styles.inputField} />
                        <button type="submit" style={styles.submitBtn}>Commit Product Parameters</button>
                    </form>
                )}

                {activeTab === 'storagebin' && (
                    <form onSubmit={handleCreateBin} style={styles.verticalForm}>
                        <h3>Map Storage Location Footprint</h3>
                        <label style={styles.fieldLabel}>Storage Zone / Area:</label>
                        <select value={binForm.zone} onChange={e => setBinForm({ ...binForm, zone: e.target.value })} style={{ ...styles.inputField, color: '#212529', backgroundColor: '#ffffff', WebkitAppearance: 'menulist', appearance: 'menulist' }} required>
                            <option value="" disabled style={{ color: '#6c757d' }}>-- Select Zone Area --</option>
                            <option value="ELECTRONICS">ELECTRONICS</option>
                            <option value="GROCERY">GROCERY</option>
                            <option value="APPAREL">APPAREL</option>
                        </select>
                        <label style={styles.fieldLabel}>Row Location Identifier (Number):</label>
                        <input type="number" min="1" placeholder="e.g., 3" value={binForm.rowNum} onChange={e => setBinForm({ ...binForm, rowNum: e.target.value })} style={styles.inputField} autoComplete="off" name="rowNumInput" required />
                        <label style={styles.fieldLabel}>Specific Bin Box Position Identifier (Number):</label>
                        <input type="number" min="1" placeholder="e.g., 13" value={binForm.binNum} onChange={e => setBinForm({ ...binForm, binNum: e.target.value })} style={styles.inputField} autoComplete="off" name="binNumInput" required />
                        <label style={styles.fieldLabel}>Permitted Product Category Bounds:</label>
                        <select value={binForm.allowedCategory} onChange={e => setBinForm({ ...binForm, allowedCategory: e.target.value })} style={{ ...styles.inputField, color: '#212529', backgroundColor: '#ffffff', WebkitAppearance: 'menulist', appearance: 'menulist' }} required>
                            <option value="" disabled style={{ color: '#6c757d' }}>-- Select Allowed Category --</option>
                            <option value="ELECTRONICS">ELECTRONICS</option>
                            <option value="GROCERY">GROCERY</option>
                            <option value="APPAREL">APPAREL</option>
                        </select>
                        <label style={styles.fieldLabel}>Parent Host Warehouse Domain Assignment:</label>
                        <select value={binForm.warehouseId} onChange={e => setBinForm({ ...binForm, warehouseId: e.target.value })} style={{ ...styles.inputField, color: '#212529', backgroundColor: '#ffffff', WebkitAppearance: 'menulist', appearance: 'menulist' }} required>
                            <option value="" disabled style={{ color: '#6c757d' }}>-- Select Parent Warehouse --</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.location})</option>)}
                        </select>
                        <button type="submit" style={styles.submitBtn}>Anchor Storage Bin Row</button>
                    </form>
                )}

                {/* 🎯 NEW TAB PANEL MARKUP: Maps properties strictly matching Postman specs */}
                {activeTab === 'inventory' && (
                    <form onSubmit={handleCreateInventory} style={styles.verticalForm}>
                        <h3>Initialize Inventory Stock Allocation</h3>
                        
                        {/* Numerical Stock Field - Keyboard typing fully unlocked */}
                        <label style={styles.fieldLabel}>Starting On-Hand Stock Volume (Quantity):</label>
                        <input type="number" min="0" placeholder="e.g., 55" value={inventoryForm.quantity} onChange={e => setInventoryForm({ ...inventoryForm, quantity: e.target.value })} style={styles.inputField} autoComplete="off" name="startingQuantityInput" required />

                        {/* Relational Product Dropdown */}
                        <label style={styles.fieldLabel}>Target Core Product Assignment Model:</label>
                        <select 
                            value={inventoryForm.productId} 
                            onChange={e => setInventoryForm({ ...inventoryForm, productId: e.target.value })} 
                            style={{ ...styles.inputField, color: '#212529', backgroundColor: '#ffffff', WebkitAppearance: 'menulist', appearance: 'menulist' }} 
                            required
                        >
                            <option value="" disabled style={{ color: '#6c757d' }}>-- Select Master Product SKU --</option>
                            {products.length === 0 ? (
                                <option value="" disabled>No products registered in master catalog records.</option>
                            ) : (
                                products.map(p => (
                                    <option key={p.id} value={p.id} style={{ color: '#212529', backgroundColor: '#ffffff' }}>
                                        {p.sku} — {p.name}
                                    </option>
                                ))
                            )}
                        </select>

                        {/* Relational Storage Bin Dropdown addressing structural zones directly */}
                        <label style={styles.fieldLabel}>Destination Host Storage Bin Allocation Address:</label>
                        <select 
							value={inventoryForm.storageBinId} 
							onChange={e => setInventoryForm({ ...inventoryForm, storageBinId: e.target.value })} 
							style={{ ...styles.inputField, color: '#212529', backgroundColor: '#ffffff', WebkitAppearance: 'menulist', appearance: 'menulist' }} 
							required
						>
							<option value="" disabled style={{ color: '#6c757d' }}>-- Select Target Storage Bin --</option>
							{storageBins.length === 0 ? (
								<option value="" disabled>No storage bins mapped inside system infrastructure records.</option>
							) : (
								storageBins.map(b => (
									<option key={b.id} value={b.id} style={{ color: '#212529', backgroundColor: '#ffffff' }}>
										{/* 🎯 THE BIN CODE SOLUTION: Directly show the backend's generated string */}
										ID #{b.id} | Location: {b.binCode || `Bin Asset Row — #${b.id}`}
									</option>
								))
							)}
						</select>

                        <button type="submit" style={styles.submitBtn}>Initialize Inventory Row</button>
                    </form>
                )}

                {activeTab === 'user' && (
                    <form onSubmit={handleCreateUser} style={styles.verticalForm}>
                        <h3>Provision Enterprise Identity Coordinates</h3>
                        <label style={styles.fieldLabel}>Account Identifier Username:</label>
                        <input type="text" placeholder="Full name or registry identifier email" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} style={styles.inputField} required />
                        <label style={styles.fieldLabel}>Secure Access Lock Password String:</label>
                        <input type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} style={styles.inputField} required />
                        <label style={styles.fieldLabel}>Role System Permission Clearances Level:</label>
                        <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} style={{ ...styles.inputField, color: '#212529', backgroundColor: '#ffffff', WebkitAppearance: 'menulist', appearance: 'menulist' }} required>
                            <option value="" disabled style={{ color: '#6c757d' }}>-- Select Role Clearance --</option>
                            <option value="OPERATOR">WAREHOUSE OPERATOR</option>
                            <option value="ADMIN">SYSTEM ADMINISTRATOR</option>
                        </select>
                        <label style={styles.fieldLabel}>Primary Physical Operating Deployment Facility:</label>
                        <select value={userForm.warehouseId} onChange={e => setUserForm({ ...userForm, warehouseId: e.target.value })} style={{ ...styles.inputField, color: '#212529', backgroundColor: '#ffffff', WebkitAppearance: 'menulist', appearance: 'menulist' }} required>
                            <option value="" disabled style={{ color: '#6c757d' }}>-- Select Parent Warehouse --</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.location})</option>)}
                        </select>
                        <button type="submit" style={styles.submitBtn}>Issue Credentials Profile</button>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    consoleContainer: { background: '#ffffff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '30px', textAlign: 'left' },
    consoleTitle: { margin: 0, fontSize: '20px', color: '#212529', fontWeight: 'bold' },
    consoleSubtitle: { margin: '5px 0 20px 0', fontSize: '13px', color: '#6c757d' },
    tabBar: { display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #f1f3f5', paddingBottom: '12px', flexWrap: 'wrap' },
    tabBtn: { border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'all 0.2s' },
    formContainer: { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '6px', border: '1px solid #e9ecef' },
    verticalForm: { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px' },
    fieldLabel: { fontSize: '12px', color: '#495057', fontWeight: 'bold', marginBottom: '-4px' },
    inputField: { padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', outline: 'none', background: '#ffffff', color: '#212529' },
    submitBtn: { padding: '11px 20px', background: '#28a745', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '10px', transition: 'background 0.2s' },
    alertBanner: { padding: '12px 15px', borderRadius: '4px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold' }
};

export default AdminManagementConsole;