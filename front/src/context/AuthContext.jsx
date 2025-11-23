// src/context/AuthContext.jsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "tokyo_auth";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [ready, setReady] = useState(false);

    // чтение auth из localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.token) {
                    setToken(parsed.token);
                    setUser(parsed.user || null);
                }
            }
        } catch (e) {
            console.error("Auth load error", e);
        } finally {
            setReady(true);
        }
    }, []);

    const login = (data) => {
        const { token, user } = data || {};
        setToken(token || null);
        setUser(user || null);
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ token, user }),
            );
        } catch (e) {
            console.error("Auth save error", e);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error("Auth clear error", e);
        }
    };

    const value = {
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
        ready,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
