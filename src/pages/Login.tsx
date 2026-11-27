import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { auth, missingFirebaseConfigKeys } from "../lib/firebase";
import api from "../lib/api";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";

// UltraHealers SVG Logo
function UltraHealersLogo({ size = 48 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="uhg-logo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#01A3B4" />
                    <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="22" fill="url(#uhg-logo)" opacity="0.15" />
            <circle cx="24" cy="24" r="18" fill="url(#uhg-logo)" opacity="0.25" />
            <text
                x="50%"
                y="52%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, Segoe UI, Roboto"
                fontSize="16"
                fontWeight={700}
                fill="#01A3B4"
            >
                UH
            </text>
        </svg>
    );
}

export function Login() {
    const [mode, setMode] = useState<"login" | "forgot">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { user, loading } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!loading && user) {
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        return <Navigate to={from} replace />;
    }

    const switchMode = (nextMode: "login" | "forgot") => {
        setMode(nextMode);
        setShowPassword(false);
        setError("");
        setSuccessMessage("");
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            const from = (location.state as any)?.from?.pathname || "/dashboard";
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error("Login failed:", err);

            if (err?.code === "auth/api-key-not-valid" || err?.message?.includes("api-key-not-valid")) {
                setError(`Firebase web config is invalid. Check admin-console .env values, especially ${missingFirebaseConfigKeys.map(([key]) => key).join(", ") || "VITE_FIREBASE_API_KEY"}. Then restart Vite.`);
            } else {
                setError("Invalid email or password. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        const normalizedEmail = trimmedEmail.toLowerCase();
        if (!trimmedEmail) {
            setError("Please enter your admin email address.");
            return;
        }

        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        const genericConfirmation = `If an admin account exists for ${trimmedEmail}, a password reset link has been sent. Please check your inbox and spam folder.`;

        try {
            // 1. Check VITE_ADMIN_EMAILS allowlist first
            const allowedEmails = String(import.meta.env.VITE_ADMIN_EMAILS || "")
                .split(",")
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean);

            let isAuthorizedAdmin = allowedEmails.includes(normalizedEmail);

            // 2. Otherwise verify with backend (Firebase Auth admin custom claims / settings)
            if (!isAuthorizedAdmin) {
                try {
                    const { data } = await api.post<{ success: boolean; allowed: boolean }>(
                        "/api/auth/admin/check-reset",
                        { email: trimmedEmail }
                    );
                    isAuthorizedAdmin = Boolean(data?.allowed);
                } catch (checkErr) {
                    console.error("Failed to verify admin reset eligibility:", checkErr);
                    setError("Unable to verify admin account right now. Please try again.");
                    return;
                }
            }

            // Do not send reset emails for non-admin or unknown accounts
            if (!isAuthorizedAdmin) {
                setSuccessMessage(genericConfirmation);
                return;
            }

            await sendPasswordResetEmail(auth, trimmedEmail, {
                url: `${window.location.origin}/login`,
                handleCodeInApp: false,
            });
            setSuccessMessage(genericConfirmation);
        } catch (err: any) {
            console.error("Password reset failed:", err);

            if (err?.code === "auth/user-not-found") {
                setSuccessMessage(genericConfirmation);
            } else if (err?.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else if (err?.code === "auth/too-many-requests") {
                setError("Too many reset requests. Please wait a few minutes and try again.");
            } else if (err?.code === "auth/api-key-not-valid" || err?.message?.includes("api-key-not-valid")) {
                setError(`Firebase web config is invalid. Check admin-console .env values, especially ${missingFirebaseConfigKeys.map(([key]) => key).join(", ") || "VITE_FIREBASE_API_KEY"}. Then restart Vite.`);
            } else {
                setError("Unable to send password reset email. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            background: "linear-gradient(135deg, #0B0F19 0%, #1a153a 50%, #0d2830 100%)",
            padding: "16px"
        }}>
            {/* Card Container */}
            <div style={{
                width: "100%",
                maxWidth: "400px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                overflow: "hidden"
            }}>

                {/* Top accent line */}
                <div style={{
                    height: "4px",
                    width: "100%",
                    background: "linear-gradient(to right, #01A3B4, #4d71e2, #7C3AED)"
                }} />

                <div style={{ padding: "40px 32px" }}>
                    {/* Logo + heading */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "32px" }}>
                        <div style={{
                            marginBottom: "24px",
                            padding: "8px",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "16px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                        }}>
                            <UltraHealersLogo size={56} />
                        </div>
                        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#ffffff", margin: "0 0 8px 0" }}>
                            UltraHealers
                        </h1>
                        <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.5)", margin: "0" }}>
                            {mode === "login" ? "Secure Admin Control Panel" : "Reset Your Admin Password"}
                        </p>
                    </div>

                    {/* Status / Error container */}
                    <div style={{ minHeight: "44px", marginBottom: "8px" }}>
                        {error && (
                            <div style={{
                                padding: "12px",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                color: "#f87171",
                                fontSize: "14px",
                                borderRadius: "12px",
                                textAlign: "center",
                                fontWeight: "500"
                            }}>
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div style={{
                                padding: "12px",
                                backgroundColor: "rgba(16, 185, 129, 0.12)",
                                border: "1px solid rgba(16, 185, 129, 0.28)",
                                color: "#6ee7b7",
                                fontSize: "13px",
                                lineHeight: "1.5",
                                borderRadius: "12px",
                                textAlign: "center",
                                fontWeight: "500"
                            }}>
                                {successMessage}
                            </div>
                        )}
                    </div>

                    {/* Form */}
                    {mode === "login" ? (
                        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label
                                    htmlFor="email"
                                    style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255, 255, 255, 0.7)", marginLeft: "4px" }}
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@ultrahealers.com"
                                    required
                                    disabled={isLoading}
                                    style={{
                                        width: "100%",
                                        height: "48px",
                                        padding: "0 16px",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                                        color: "#ffffff",
                                        fontSize: "14px",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
                                    <label
                                        htmlFor="password"
                                        style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255, 255, 255, 0.7)" }}
                                    >
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => switchMode("forgot")}
                                        disabled={isLoading}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            padding: 0,
                                            color: "#22d3ee",
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            cursor: isLoading ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div style={{ position: "relative", width: "100%" }}>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                        style={{
                                            width: "100%",
                                            height: "48px",
                                            padding: "0 44px 0 16px",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                                            color: "#ffffff",
                                            fontSize: "14px",
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        disabled={isLoading}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        title={showPassword ? "Hide password" : "Show password"}
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            padding: "4px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "rgba(255, 255, 255, 0.6)",
                                            cursor: isLoading ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: "100%",
                                    height: "48px",
                                    marginTop: "8px",
                                    borderRadius: "12px",
                                    border: "none",
                                    color: "#ffffff",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    opacity: isLoading ? 0.6 : 1,
                                    background: isLoading
                                        ? "#4b5563"
                                        : "linear-gradient(135deg, #01A3B4 0%, #7C3AED 100%)",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                {isLoading ? "Authenticating..." : "Sign in to Dashboard"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <p style={{
                                fontSize: "13px",
                                color: "rgba(255, 255, 255, 0.6)",
                                lineHeight: "1.5",
                                margin: 0,
                                textAlign: "center"
                            }}>
                                Enter your admin email address and we&apos;ll send you a link to reset your password.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label
                                    htmlFor="reset-email"
                                    style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255, 255, 255, 0.7)", marginLeft: "4px" }}
                                >
                                    Admin email address
                                </label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@ultrahealers.com"
                                    required
                                    disabled={isLoading}
                                    style={{
                                        width: "100%",
                                        height: "48px",
                                        padding: "0 16px",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                                        color: "#ffffff",
                                        fontSize: "14px",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: "100%",
                                    height: "48px",
                                    marginTop: "4px",
                                    borderRadius: "12px",
                                    border: "none",
                                    color: "#ffffff",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    opacity: isLoading ? 0.6 : 1,
                                    background: isLoading
                                        ? "#4b5563"
                                        : "linear-gradient(135deg, #01A3B4 0%, #7C3AED 100%)",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                {isLoading ? "Sending reset link..." : "Send Reset Link"}
                            </button>

                            <button
                                type="button"
                                onClick={() => switchMode("login")}
                                disabled={isLoading}
                                style={{
                                    background: "none",
                                    border: "none",
                                    padding: "4px 0",
                                    color: "rgba(255, 255, 255, 0.7)",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    textAlign: "center"
                                }}
                            >
                                ← Back to Sign In
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: "20px 32px",
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    textAlign: "center"
                }}>
                    <p style={{
                        fontSize: "12px",
                        color: "rgba(255, 255, 255, 0.4)",
                        letterSpacing: "0.05em",
                        fontWeight: "500",
                        margin: 0
                    }}>
                        ULTRAHEALERS © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
