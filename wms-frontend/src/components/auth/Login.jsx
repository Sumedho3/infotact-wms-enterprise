import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from './AuthContext';

const Login = ({ switchToRegister }) => {
    const { loginService } = useAuth();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // 🎯 NEW: State tracking to handle our custom animated success toast
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
	let tokenReceived = false; // 🎯 FIX: Track success locally within function scope

        try {
            const response = await axiosClient.post('/api/auth/login', {
                username: username,
                password: password
            });

            const jwtToken = response.data.jwtToken;

            if (jwtToken) {

		tokenReceived = true; // Mark as successful
                // 🎯 FIX: Trigger our sleek floating toast banner instead of the browser popup
                setShowSuccessToast(true);

                // Wait exactly 2 seconds for the visual banner before switching states
                setTimeout(() => {
                    setShowSuccessToast(false);
                    loginService(jwtToken, username); 
                }, 2000);
            }
        } catch (err) {
        // 🎯 FIX: Explicitly turn off loading state right here if authentication fails
        setLoading(false); 
        
        if (err.response && err.response.status === 401) {
            setError('Invalid username or password. Please try again.');
        } else {
            setError('Unable to connect to the authentication server.');
        }
    } finally {
        // 🎯 FIX: Only keep loading active if a valid token is actively processing redirection
        if (!tokenReceived) {
            setLoading(false);
        }
    }
};

    return (
        <div style={styles.container}>
            {/* 🎯 NEW: Floating Autohide Notification Banner */}
            {showSuccessToast && (
                <div style={styles.toast}>
                    <span style={styles.toastIcon}>✓</span>
                    Login successfully!
                </div>
            )}

            <div style={styles.card}>
                <h2 style={styles.title}>WMS Enterprise Login</h2>
                
                <div style={{ minHeight: '40px', marginBottom: '15px', position: 'relative', width: '100%' }}>
    			{error ? (
        			<div style={styles.errorAlert}>{error}</div>
    				) : null}
		</div>

                <form onSubmit={handleLoginSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required 
                            placeholder="Enter username"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required 
                            placeholder="Enter password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
                    >
                        {loading && !showSuccessToast ? 'Authenticating...' : showSuccessToast ? 'Redirecting...' : 'Sign In'}
                    </button>
                </form>

                <p style={styles.footerText}>
                    Need an enterprise account?{' '}
                    <span onClick={switchToRegister} style={styles.link}>
                        Register Here
                    </span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto', fontFamily: 'Arial, sans-serif', position: 'relative' },
    // 🎯 NEW: Production-grade Fixed Toast Notification Styling
    toast: {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#28a745',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '50px',
        boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
        fontSize: '15px',
        fontWeight: 'bold',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: 'fadeInDown 0.3s ease-out'
    },
    toastIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px'
    },
    card: { 
    width: '360px', 
    padding: '40px', 
    borderRadius: '8px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
    background: '#fff' 
    // position: 'relative' can be removed or kept, it won't interfere now
},
    title: { textAlign: 'center', marginBottom: '24px', color: '#333' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '6px', fontSize: '14px', color: '#666', fontWeight: 'bold', textAlign: 'left' },
    input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px', background: '#333333', color: '#ffffff' },
    button: { width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
    buttonDisabled: { background: '#cccccc', cursor: 'not-allowed' },
    errorAlert: { 
    // 🎯 REMOVED absolute constraints to prevent text overlaps completely
    width: '100%',
    padding: '10px', 
    background: '#f8d7da', 
    color: '#721c24', 
    borderRadius: '4px', 
    fontSize: '13px', 
    border: '1px solid #f5c6cb', 
    textAlign: 'center',
    boxSizing: 'border-box'
},
    footerText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' },
    link: { color: '#007bff', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }
};

export default Login;