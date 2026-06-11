import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8081', 
    timeout: 5000,                    
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Styled UI Popup banner for Global System Failures
const showDesignedSecurityAlert = (title, message, isWarning = true) => {
    if (document.getElementById('wms-custom-alert')) return;

    const alertDiv = document.createElement('div');
    alertDiv.id = 'wms-custom-alert';
    
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
        zIndex: '20000',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        textAlign: 'center',
        minWidth: '350px'
    });

    alertDiv.innerHTML = `
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 6px;">⚠️ ${title}</div>
        <div>${message}</div>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 4500);
};

// 🎯 RESPONSE INTERCEPTOR: Differentiates Server Responses from Infrastructure Dropouts
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // 🚨 PROBLEM 1 FIX: If error.response is missing, the server is dead/inactive!
        if (!error.response) {
            showDesignedSecurityAlert(
                "Network Infrastructure Error", 
                "Cannot connect to Spring Boot server. Verify your backend service is running on port 8081.", 
                false
            );
            return Promise.reject(new Error("Server Is Inactive"));
        }

        const { status, data } = error.response;
        const backendMessage = data && data.error ? data.error : (data && data.message ? data.message : '');

        switch (status) {
            case 401:
                localStorage.removeItem('token');
                showDesignedSecurityAlert("Session Expired", "Returning to login.", true);
                setTimeout(() => { window.location.href = '/'; }, 2000);
                break;

            case 400:
            case 422:
                // 🎯 THE PASSTHROUGH FIX: Remove the vanishing showDesignedSecurityAlert popup.
				// Instead, log it to the console and let it reject naturally.
				// This delivers the {"error": "Warehouse Storage Overflow..."} payload directly into your component's catch block!
				console.warn(`Validation Challenge (${status}): Forwarding error attributes down to active UI panels.`);
                break;

            case 403:
                console.warn("Access Forbidden (403).");
                break;

            default:
                break;
        }

        return Promise.reject(error);
    }
);

export default axiosClient;