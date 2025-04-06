'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { TokenPayload } from './token';

interface AuthContextType {
    user: TokenPayload | null;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ token, children }: { token: TokenPayload, children: React.ReactNode }) => {
    const [user, setUser] = useState<TokenPayload | null>(token);

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, logout }}>
        {children}
    </AuthContext.Provider>
};