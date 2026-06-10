import axios from 'axios';

// 1. Central network client instance configuration
const axiosClient = axios.create({
    baseURL: 'http://localhost:8081', 
    timeout: 5000,                    
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 2. Request Interceptor: Inject bearer token string dynamically on every single outbound network request
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 🎯 Inject Elegant Custom Alert Notification to replacing blocking alert boxes
const showDesignedSecurityAlert = (title, message, isWarning = true) => {
    // Check if an alert element already exists on screen to avoid stacking duplicates
    if (document.getElementById('wms-custom-alert')) return;

    const alertDiv = document.createElement('div');
    alertDiv.id = 'wms-custom-alert';
    
    // Inline CSS for a professional, centered security card popup
    Object.assign(alertDiv.style, {
        position: 'fixed',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: isWarning ? '#fff3cd' : '#f8d7da',
        color: isWarning ? '#856404' : '#721c24',
        border: isWarning ? '1px solid #ffeeba' : '1px solid #f5c6cb',
        padding: '16px 28px',
        borderRadius: '6px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        zIndex: '10000',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        textAlign: 'center',
        minWidth: '320px',
        transition: 'all 0.4s ease',
        opacity: '0'
    });

    alertDiv.innerHTML = `
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 6px;">⚠️ ${title}</div>
        <div>${message}</div>
    `;

    document.body.appendChild(alertDiv);

    // Fade in effect animation
    setTimeout(() => { alertDiv.style.opacity = '1'; }, 10);

    // Automatically remove after 3 seconds
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 400);
    }, 3000);
};

// 🎯 3. Optimized Response Interceptor
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            const backendMessage = data && data.message ? data.message : '';

            // Helper function to handle full session invalidation on the frontend side
            const forceImmediateLogout = (alertTitle, alertContent, isWarningStyle) => {
                showDesignedSecurityAlert(alertTitle, alertContent, isWarningStyle);
                
                // Clear the corrupted or expired token from disk storage immediately
                localStorage.removeItem('token'); 
                
                // Wait exactly 2.5 seconds for the custom alert to be seen before forcing redirect
                setTimeout(() => {
                    window.location.href = '/';
                }, 2500);
            };

            switch (status) {
                case 401:
                    // 🛑 Stale/Missing Credentials -> Session is fully expired, force a login reload
                    forceImmediateLogout(
                        "Session Expired (HTTP 401)", 
                        backendMessage || "Your token credentials are invalid. Returning to login screen.",
                        true
                    );
                    break;

                case 403:
                    // 🚫 Roles/Privileges Mismatch (e.g. OPERATOR vs ROLE_OPERATOR role issues)
                    // 🎯 THE OPTIMIZATION: Print the warning to the console, but DO NOT drop the session context 
                    // or force logouts. Let the operational table components catch the error naturally.
                    console.warn("Access Forbidden (HTTP 403): User doesn't possess required role authorities for this dataset layout.");
                    break;

                default:
                    // Pass common statuses (like 400 bad requests) back to operational component logs
                    break;
            }
        } else {
            console.error("Network infrastructure connection dropped:", error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;