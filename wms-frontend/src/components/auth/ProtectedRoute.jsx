import React from 'react';
import { useAuth } from './AuthContext';

/**
 * Production-grade Route Guard Component
 * Secures client-side layouts against unauthenticated operations and unauthorized role escalations.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    // 1. While the Security Desk is extracting token claims during a page refresh, show a clean loading state
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Verifying Enterprise Credentials...</p>
            </div>
        );
    }

    // 2. If no authenticated user session exists in our global state context, intercept rendering
    if (!user) {
        return (
            <div style={styles.loadingContainer}>
                <p style={{ color: '#dc3545', fontWeight: 'bold' }}>Access Denied. Please Sign In.</p>
            </div>
        );
    }

    // 3. Role-Based Access Control (RBAC) Check
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div style={styles.loadingContainer}>
                <p style={{ color: '#dc3545', fontWeight: 'bold' }}>Unauthorized. Insufficient Clearance.</p>
            </div>
        );
    }

    // 4. Clearances verified: Render the target workspace child components
    return children;
};

const styles = {
    loadingContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' },
    spinner: { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default ProtectedRoute;