import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // 👈 1. Import the production JWT decoder library

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper function to safely extract and map user claims from a token string
    const getUserFromToken = (token) => {
        try {
            const decoded = jwtDecode(token);
            
            // Production Check: Verify if the token has already expired on the user's system
            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem('token');
                return null;
            }

	    const rawRoleString = decoded.roles || 'ROLE_OPERATOR';

	    // 2. If there are multiple comma-separated roles, split and grab the first one
            const primaryRole = rawRoleString.split(',')[0];

            // Map your exact Spring Boot JWT claims to your React state structure
            return {
                username: decoded.sub,      // 'sub' is the standard JWT field for username
                role: primaryRole.replace('ROLE_', '').trim()
            };
        } catch (error) {
            console.error("Invalid token parsing attempt:", error);
            return null;
        }
    };

    // 2. Dynamic Auto-Login Check on Boot/Refresh
    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('token');
            if (token) {
                const verifiedUser = getUserFromToken(token); // 👈 Dynamically reads database roles from the token
                setUser(verifiedUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        checkLoginStatus();
    }, []);

    // 3. Dynamic Login Service
    const loginService = (token) => {
        localStorage.setItem('token', token);
        const verifiedUser = getUserFromToken(token); // 👈 Extracts who logged in dynamically
        setUser(verifiedUser);
    };

    // 4. Logout Service
    const logoutService = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginService, logoutService }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};