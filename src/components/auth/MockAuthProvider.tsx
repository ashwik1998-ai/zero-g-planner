import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Persist mock session
    useEffect(() => {
        const stored = localStorage.getItem('mock_auth_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    const signIn = async () => {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockUser: User = {
            id: 'user_123',
            name: 'Commander Shepard',
            email: 'commander@alliance.navy',
            avatar: 'https://ui-avatars.com/api/?name=Commander+Shepard&background=0D8ABC&color=fff'
        };

        setUser(mockUser);
        localStorage.setItem('mock_auth_user', JSON.stringify(mockUser));
        setIsLoading(false);
    };

    const signOut = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setUser(null);
        localStorage.removeItem('mock_auth_user');
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a MockAuthProvider');
    }
    return context;
}
