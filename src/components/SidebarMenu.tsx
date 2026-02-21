import React, { useState, useEffect } from 'react';
import { SoundService } from '../services/SoundService';

interface SidebarMenuProps {
    onToggleDashboard?: () => void;
    onToggleLeaderboard?: () => void;
    onToggleEvents?: () => void;
    onToggleHowToUse?: () => void;
}

export function SidebarMenu({
    onToggleDashboard,
    onToggleLeaderboard,
    onToggleEvents,
    onToggleHowToUse
}: SidebarMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        SoundService.playClick();
    };

    const handleAction = (action?: () => void) => {
        if (action) {
            action();
            setIsOpen(false);
            SoundService.playClick();
        }
    };

    const menuItemStyle: React.CSSProperties = {
        padding: '12px 16px',
        color: '#d1d5db',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'all 0.2s',
        fontFamily: 'Inter, system-ui, sans-serif',
    };

    const menuSectionHeader: React.CSSProperties = {
        padding: '16px 16px 6px',
        fontSize: '10px',
        color: '#a855f7', // Purple accent
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        fontWeight: 800,
        opacity: 0.8,
        fontFamily: 'Inter, system-ui, sans-serif',
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={toggleMenu}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'white', fontSize: '20px', padding: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px', transition: 'background 0.2s',
                    marginRight: '8px'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    SoundService.playHover();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                }}
            >
                ☰
            </button>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
                    onClick={toggleMenu}
                />
            )}

            {/* Sidebar Panel */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: isOpen ? 0 : '-320px',
                width: '280px',
                height: '100vh',
                background: 'rgba(8, 8, 20, 0.98)',
                borderRight: '1px solid rgba(168, 85, 247, 0.2)', // Purple border
                boxShadow: isOpen ? '10px 0 30px rgba(0,0,0,0.5)' : 'none',
                zIndex: 3001,
                transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(20px)'
            }}>
                {/* Header inside sidebar */}
                <div style={{
                    padding: '20px 16px',
                    borderBottom: '1px solid rgba(168, 85, 247, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span style={{
                        fontSize: '16px', fontWeight: 800, letterSpacing: '0.5px',
                        background: 'linear-gradient(90deg, #a855f7, #60a5fa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Zero-G Workspace
                    </span>
                    <button
                        onClick={toggleMenu}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingTop: '8px' }}>
                    <div style={menuSectionHeader}>Missions & Activity</div>

                    <div
                        onClick={() => handleAction(onToggleDashboard)}
                        style={menuItemStyle}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d1d5db'; }}
                    >
                        <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>📊</span> Mission Control
                    </div>

                    <div
                        onClick={() => handleAction(onToggleLeaderboard)}
                        style={menuItemStyle}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d1d5db'; }}
                    >
                        <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>🌌</span> Galactic Leaderboard
                    </div>

                    <div style={menuSectionHeader}>Planner & Calendar</div>

                    <div
                        onClick={() => handleAction(onToggleEvents)}
                        style={menuItemStyle}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d1d5db'; }}
                    >
                        <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>🗓️</span> Special Events
                    </div>

                    <div style={menuSectionHeader}>Help & Support</div>

                    <div
                        onClick={() => handleAction(onToggleHowToUse)}
                        style={menuItemStyle}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d1d5db'; }}
                    >
                        <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>📖</span> How to Use
                    </div>
                </div>
            </div>
        </>
    );
}
