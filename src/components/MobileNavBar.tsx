import { useState } from 'react';

interface MobileNavBarProps {
    activeTab: 'schedule' | 'orbit' | 'logs';
    setActiveTab: (tab: 'schedule' | 'orbit' | 'logs') => void;
    onAddMission?: () => void;
}

export function MobileNavBar({ activeTab, setActiveTab, onAddMission }: MobileNavBarProps) {
    return (
        <div style={{
            position: 'relative',
            height: '72px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 'env(safe-area-inset-bottom, 12px)',
            boxSizing: 'border-box',
        }}>
            {/* Glassmorphic pill */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(10, 10, 30, 0.85)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '40px',
                padding: '6px',
                gap: '4px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}>
                <NavButton
                    label="Schedule"
                    icon="📅"
                    isActive={activeTab === 'schedule'}
                    onClick={() => setActiveTab('schedule')}
                />

                {/* Center FAB */}
                <button
                    onClick={onAddMission}
                    style={{
                        width: '48px', height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px',
                        boxShadow: '0 0 20px rgba(59,130,246,0.6), 0 4px 12px rgba(0,0,0,0.4)',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        transform: 'scale(1)',
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.9)')}
                    onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    ✦
                </button>

                <NavButton
                    label="Logs"
                    icon="📜"
                    isActive={activeTab === 'logs'}
                    onClick={() => setActiveTab('logs')}
                />
            </div>

            {/* Orbit tab — floated separately as a glyph above the pill center */}
            <button
                onClick={() => setActiveTab('orbit')}
                style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '44px', height: '44px',
                    borderRadius: '50%',
                    background: activeTab === 'orbit'
                        ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                        : 'rgba(255,255,255,0.08)',
                    border: activeTab === 'orbit'
                        ? '2px solid rgba(168,85,247,0.6)'
                        : '2px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px',
                    boxShadow: activeTab === 'orbit'
                        ? '0 0 20px rgba(168,85,247,0.5), 0 4px 16px rgba(0,0,0,0.5)'
                        : '0 2px 8px rgba(0,0,0,0.4)',
                    transition: 'all 0.25s',
                    zIndex: 10,
                }}
            >
                🪐
            </button>
        </div>
    );
}

function NavButton({ label, icon, isActive, onClick }: {
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}) {
    const [pressed, setPressed] = useState(false);
    return (
        <button
            onClick={onClick}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            style={{
                background: isActive ? 'rgba(59,130,246,0.2)' : 'transparent',
                border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                borderRadius: '28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                color: isActive ? '#60a5fa' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: '6px 14px',
                transform: pressed ? 'scale(0.92)' : 'scale(1)',
            }}
        >
            <span style={{
                fontSize: '18px',
                filter: isActive ? 'drop-shadow(0 0 6px rgba(59,130,246,0.7))' : 'grayscale(80%)',
                transition: 'filter 0.2s',
            }}>
                {icon}
            </span>
            <span style={{
                fontSize: '9px',
                fontWeight: isActive ? 800 : 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}>
                {label}
            </span>
        </button>
    );
}
