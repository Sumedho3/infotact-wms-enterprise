import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the central context tracking bucket
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 2. Automatically check for an active token when the app boots up
    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('token');
            if (token) {
                // For a prototype baseline, we simulate extracting user data from the token.
                // In production, you can use a library like 'jwt-decode' to read real role claims.
                setUser({
                    username: 'authenticated_user',
                    role: 'OPERATOR' // Fallback baseline role
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        checkLoginStatus();
    }, []);

    // 3. Login helper function to update global state instantly
    const loginService = (token, username) => {
        localStorage.setItem('token', token);
        setUser({ username: username, role: 'ADMIN' }); // Simulating role assignment on login
    };

    // 4. Logout helper function to clean up storage
    const logoutService = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // 5. Expose the authentication state data to all child components
    return (
        <AuthContext.Provider value={{ user, loading, loginService, logoutService }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 6. Custom hook to make importing this service dead-simple for your team
export const useAuth = () => { 
    return useContext(AuthContext);
};