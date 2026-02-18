import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { SoundService } from '../services/SoundService';
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';

export function Header() {
    const { isSignedIn } = useUser();
    const xp = useTaskStore(state => state.xp);
    const level = useTaskStore(state => state.level);
    const [isMuted, setIsMuted] = useState(SoundService.isMuted);
    const [showInstructions, setShowInstructions] = useState(false);

    // Level calculation for progress bar (0-100% of current level)
    // Level 1 = 0-500XP
    // Level 2 = 500-1000XP
    const xpForNextLevel = 500;
    const progress = (xp % xpForNextLevel) / xpForNextLevel * 100;

    const toggleSound = () => {
        const muted = SoundService.toggleMute();
        setIsMuted(muted);
        if (!muted) SoundService.playClick();
    };

    return (
        <div style={{
            height: '60px',
            width: '100%',
            background: '#050510',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px', // Reduced padding for mobile
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            zIndex: 1000,
            position: 'relative',
            whiteSpace: 'nowrap'
        }}>
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', letterSpacing: '-0.5px' }}>
                    Zero-G Planner
                </div>
                {/* Level Badge */}
                <div style={{
                    marginLeft: '15px',
                    padding: '2px 8px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '4px',
                    color: '#60a5fa',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
                    title={`Level ${level}: ${xp} Total XP`}
                >
                    <span>LVL {level}</span>
                    <div style={{ width: '60px', height: '4px', background: 'rgba(0,0,0,0.5)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: '#60a5fa', transition: 'width 0.5s' }} />
                    </div>
                </div>
            </div>

            {/* Right Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '14px', color: '#9ca3af' }}>

                {/* Instructions Button */}
                <button
                    onClick={() => {
                        setShowInstructions(true);
                        SoundService.playClick();
                    }}
                    onMouseEnter={() => SoundService.playHover()}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', filter: 'grayscale(1)' }}
                    title="How to Play"
                >
                    ℹ️
                </button>

                {/* Sound Toggle */}
                <button
                    onClick={toggleSound}
                    onMouseEnter={() => SoundService.playHover()}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                    {isMuted ? '🔇' : '🔊'}
                </button>

                {isSignedIn ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                        onMouseEnter={() => SoundService.playHover()}>
                        <UserButton afterSignOutUrl="/" appearance={{
                            elements: {
                                userButtonAvatarBox: "w-8 h-8"
                            }
                        }} />
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', display: 'none' }}>Profile</span>
                    </div>
                ) : (
                    <SignInButton mode="modal">
                        <button
                            onMouseEnter={() => SoundService.playHover()}
                            onClick={() => SoundService.playClick()}
                            style={{
                                background: '#3b82f6', // Bright Blue
                                border: 'none',
                                cursor: 'pointer',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                fontSize: '13px',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 5px rgba(59, 130, 246, 0.5)'
                            }}
                            className="hover:bg-blue-600 hover:scale-105"
                        >
                            Sign In
                        </button>
                    </SignInButton>
                )}
            </div>

            {/* Instructions Modal */}
            {showInstructions && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.8)', zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setShowInstructions(false)}>
                    <div style={{
                        background: '#1f2937', padding: '30px', borderRadius: '15px',
                        maxWidth: '500px', width: '90%', color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, color: '#60a5fa' }}>🚀 Zero-G Flight Manual</h2>

                        <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>🌟 Levels & XP</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                                    Complete missions to earn XP and rank up!
                                    <br />🔴 <b>Urgent (Red):</b> 100 XP
                                    <br />🟠 <b>Normal (Orange):</b> 50 XP
                                    <br />🟢 <b>Casual (Green):</b> 25 XP
                                </p>
                            </div>

                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>🪐 Orbit Physics</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                                    <b>Distance:</b> Closer = More Urgent.
                                    <br /><b>Angle:</b> Positioned by Time of Day (Clockwise).
                                </p>
                            </div>

                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>🎮 Controls</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                                    <b>Click</b> a planet to edit.
                                    <br /><b>Mobile:</b> Use bottom tabs to navigate.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowInstructions(false)}
                            style={{
                                marginTop: '20px', width: '100%', padding: '10px',
                                background: '#3b82f6', border: 'none', borderRadius: '8px',
                                color: 'white', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
