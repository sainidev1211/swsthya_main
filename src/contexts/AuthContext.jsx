import { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from './NotificationContext';
import { API_BASE_URL } from '../api/config';

const AuthContext = createContext();
const API_URL = API_BASE_URL;

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const { init, disconnect } = useNotifications();

    useEffect(() => {
        const storedUserId = localStorage.getItem('swasthya_user_id');
        const token = localStorage.getItem('swasthya_auth_token');

        if (storedUserId && token) {
            fetch(`${API_URL}/users/${storedUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(async res => {
                    if (!res.ok) throw new Error(`API Error: ${res.status}`);
                    return await res.json();
                })
                .then(result => {
                    if (result.success && result.data) {
                        setUser({ ...result.data, token });
                        setIsGuest(result.data.username?.startsWith('Guest'));
                        init(result.data._id);
                    }
                })
                .catch(err => {
                    console.error("Auth sync error:", err);
                    // Clear invalid session
                    localStorage.removeItem('swasthya_user_id');
                    localStorage.removeItem('swasthya_auth_token');
                    localStorage.removeItem('swasthya_user_data');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (identifier, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Login API Error:", errorText);
                throw new Error(`Login failed: ${res.status}`);
            }

            let data;
            try {
                data = await res.json();
            } catch (err) {
                console.error("Login JSON Parse Error:", err);
                throw new Error("Invalid response from server");
            }
            
            if (!data.success) {
                throw new Error(data.message || 'Invalid email or password.');
            }

            const loggedInUser = { ...data.data, token: data.token };
            localStorage.setItem('swasthya_user_id', loggedInUser._id);
            localStorage.setItem('swasthya_auth_token', data.token);
            localStorage.setItem('swasthya_user_data', JSON.stringify(loggedInUser));
            
            setUser(loggedInUser);
            setIsGuest(loggedInUser.username?.startsWith('Guest') || false);
            init(loggedInUser._id);
            return loggedInUser;
        } catch (error) {
            console.error("Login Error:", error);
            throw new Error(error.message || "Failed to sign in. Please try again.");
        }
    };

    const signup = async (userData) => {
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Signup API Error:", errorText);
                throw new Error(`Signup failed: ${res.status}`);
            }

            let data;
            try {
                data = await res.json();
            } catch (err) {
                console.error("Signup JSON Parse Error:", err);
                throw new Error("Invalid response from server");
            }

            if (!data.success) {
                throw new Error(data.message || 'Failed to create account.');
            }

            const newUserProfile = data.data;
            localStorage.setItem('swasthya_user_id', newUserProfile._id);
            setUser(newUserProfile);
            setIsGuest(false);
            init(newUserProfile._id);
            return { message: 'Signup successful', user: newUserProfile };
        } catch (error) {
            console.error("Signup Error:", error);
            throw new Error(error.message || "Failed to create account. Please try again.");
        }
    };

    const loginAsGuest = async (guestDetails) => {
        try {
            const res = await fetch(`${API_URL}/auth/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guestDetails)
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to create guest session.');
            }

            const guestProfile = data.data;
            localStorage.setItem('swasthya_user_id', guestProfile._id);
            setUser(guestProfile);
            setIsGuest(true);
            init(guestProfile._id);
            return guestProfile;
        } catch (error) {
            console.error("Guest Login Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        localStorage.removeItem('swasthya_user_id');
        localStorage.removeItem('swasthya_auth_token');
        localStorage.removeItem('swasthya_user_data');
        setUser(null);
        setIsGuest(false);
        disconnect();
    };

    const updateUser = async (newData) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/users/save-user-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, profileData: newData })
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Update User API Error:", errorText);
                throw new Error(`Update failed: ${res.status}`);
            }

            let data;
            try {
                data = await res.json();
            } catch (err) {
                throw new Error("Invalid response from server");
            }

            if (!data.success) {
                throw new Error(data.message);
            }

            setUser(data.data);
            return data.data;
        } catch (error) {
            console.error("Update User Error:", error);
            throw error;
        }
    };

    const value = {
        user,
        isGuest,
        login,
        signup,
        loginAsGuest,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
