
interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignIn: () => void;
    isLoading: boolean;
}

export function SignInModal({ isOpen, onClose, onSignIn, isLoading }: SignInModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}
            onClick={(e) => {
                // Close on click outside
                if (e.target === e.currentTarget && !isLoading) onClose();
            }}
        >
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                width: '400px',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative'
            }}>
                {/* Close Button */}
                {!isLoading && (
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#9ca3af'
                        }}
                    >
                        ✕
                    </button>
                )}

                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>
                    Sign in to Zero-G
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                    Welcome back! Please sign in to continue
                </p>

                <button
                    onClick={onSignIn}
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: 'white',
                        color: '#374151',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1,
                        marginBottom: '20px',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => !isLoading && (e.currentTarget.style.background = '#f9fafb')}
                    onMouseOut={(e) => !isLoading && (e.currentTarget.style.background = 'white')}
                >
                    {isLoading ? (
                        <span>Connecting...</span>
                    ) : (
                        <>
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                            Continue with Google
                        </>
                    )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#9ca3af' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                    <span style={{ padding: '0 10px', fontSize: '14px' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                </div>

                <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                        Email address or username
                    </label>
                    <input
                        type="email"
                        placeholder="Enter email or username"
                        disabled
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            background: '#f3f4f6',
                            cursor: 'not-allowed'
                        }}
                    />
                </div>

                <button
                    disabled
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#1f2937',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        marginTop: '20px',
                        fontWeight: '600',
                        cursor: 'not-allowed',
                        opacity: 0.8
                    }}
                >
                    Continue
                </button>

                <p style={{ marginTop: '20px', fontSize: '12px', color: '#6b7280' }}>
                    Secured by <span style={{ fontWeight: 'bold' }}>Clerk (Mock)</span>
                </p>

                {isLoading && (
                    <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '10px' }} className="animate-pulse">
                        Simulating OAuth Handshake...
                    </div>
                )}
            </div>
        </div>
    );
}
