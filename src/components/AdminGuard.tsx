import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";

export function AdminGuard() {
    const { user, loading, isAdmin } = useAdminAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the attempted url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-4">
                <div className="max-w-md w-full border border-destructive/50 rounded-lg p-6 bg-card space-y-4 shadow-sm text-center">
                    <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">
                        Your account ({user.email}) does not have administrator privileges.
                    </p>
                    <button
                        onClick={() => auth.signOut()}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors w-full"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return <Outlet />;
}

// Need to import auth for the sign out button
import { auth } from "../lib/firebase";
