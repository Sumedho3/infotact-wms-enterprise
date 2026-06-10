import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';

const Register = ({ switchToLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            // 🎯 Hits AuthController @PostMapping("/register") endpoint
            const response = await axiosClient.post('/api/auth/register', {
                username: username,
                password: password,
                role: role // Passes "ADMIN" or "OPERATOR" which your backend converts to ROLE_Enums
            });

            // Handle successful 201 response from your GlobalExceptionHandler setup
            setMessage(response.data); 
            
            // Clear fields on success
            setUsername('');
            setPassword('');
            
            // Auto-redirect to login view after a short delay
            setTimeout(() => {
                switchToLogin();
            }, 2500);

        } catch (err) {
            // Catches the 400 Bad Request if the username is already taken
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError('Unable to connect to the registration server.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h2 style={styles.title}>WMS Account Creation</h2>
            
            {message && <div style={styles.successAlert}>{message}</div>}
            {error && <div style={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleRegisterSubmit}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={styles.input}
                        required 
                        placeholder="Choose username"
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
                        placeholder="Choose strong password"
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>System Clearance Level</label>
                    <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        style={styles.select}
                    >
			<option value="" disabled hidden>--- Select Clearance Level ---</option>
                        <option value="OPERATOR">Warehouse Operator</option>
                        <option value="ADMIN">System Administrator</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
                >
                    {loading ? 'Registering Account...' : 'Create Account'}
                </button>
            </form>

            <p style={styles.footerText}>
                Already have an account?{' '}
                <span onClick={switchToLogin} style={styles.link}>Sign In Here</span>
            </p>
        </div>
    );
};

const styles = {
    card: { width: '360px', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: '#fff' },
    title: { textAlign: 'center', marginBottom: '24px', color: '#333' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '6px', fontSize: '14px', color: '#666', fontWeight: 'bold', textAlign: 'left' },
    input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' },
    select: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px', background: '#333333', color: '#ffffff', cursor: 'pointer' },
    button: { width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', marginTop: '10px' },
    buttonDisabled: { background: '#cccccc', cursor: 'not-allowed' },
    errorAlert: { padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f5c6cb', textAlign: 'center' },
    successAlert: { padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '20px', fontSize: '14px', border: '1px solid #c3e6cb', textAlign: 'center' },
    footerText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' },
    link: { color: '#007bff', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }
};

export default Register;