import React, { createContext, useContext, useEffect, useState } from "react";
import { type User, onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AdminUser extends User {
    isAdmin: boolean;
    superAdmin: boolean;
}

interface AdminAuthContextType {
    user: AdminUser | null;
    loading: boolean;
    isAdmin: boolean;
    logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    logout: async () => { },
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Force token refresh to get latest claims
                    const idTokenResult = await getIdTokenResult(firebaseUser, true);

                    // Check for custom claims (from backend-server)
                    // Also fallback to a local env check just in case for development
                    const isAdminClaim = idTokenResult.claims.admin === true;
                    const isSuperAdminClaim = idTokenResult.claims.super_admin === true;

                    const allowedEmails = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",");
                    const isAllowedEmail = firebaseUser.email && allowedEmails.includes(firebaseUser.email);

                    const isAuthorized = isAdminClaim || isAllowedEmail;

                    setUser({
                        ...firebaseUser,
                        isAdmin: isAuthorized,
                        superAdmin: isSuperAdminClaim || isAllowedEmail,
                    } as AdminUser);
                } catch (error) {
                    console.error("Error fetching custom claims:", error);
                    setUser({ ...firebaseUser, isAdmin: false, superAdmin: false } as AdminUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <AdminAuthContext.Provider value={{ user, loading, isAdmin: user?.isAdmin ?? false, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
