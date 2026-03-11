import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
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
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { user, loading } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!loading && user) {
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        return <Navigate to={from} replace />;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            const from = (location.state as any)?.from?.pathname || "/dashboard";
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error("Login failed:", err);
            setError("Invalid email or password. Please try again.");
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
                            Secure Admin Control Panel
                        </p>
                    </div>

                    {/* Error container */}
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
                    </div>

                    {/* Form */}
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
                            <label
                                htmlFor="password"
                                style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255, 255, 255, 0.7)", marginLeft: "4px" }}
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
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
