import React from 'react';

interface MobileNavBarProps {
    activeTab: 'schedule' | 'orbit' | 'logs';
    setActiveTab: (tab: 'schedule' | 'orbit' | 'logs') => void;
}

export function MobileNavBar({ activeTab, setActiveTab }: MobileNavBarProps) {
    return (
        <div style={{
            height: '70px',
            width: '100%',
            background: '#050510',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 1000,
            paddingBottom: '10px', // Safe area for iOS
            boxSizing: 'border-box'
        }}>
            <NavButton
                label="Schedule"
                icon="📅"
                isActive={activeTab === 'schedule'}
                onClick={() => setActiveTab('schedule')}
            />
            <NavButton
                label="Orbit"
                icon="🪐"
                isActive={activeTab === 'orbit'}
                onClick={() => setActiveTab('orbit')}
            />
            <NavButton
                label="Logs"
                icon="📜"
                isActive={activeTab === 'logs'}
                onClick={() => setActiveTab('logs')}
            />
        </div>
    );
}

function NavButton({ label, icon, isActive, onClick }: { label: string, icon: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: isActive ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: '8px',
                flex: 1
            }}
        >
            <span style={{ fontSize: '20px', filter: isActive ? 'drop-shadow(0 0 5px rgba(59,130,246,0.5))' : 'grayscale(100%)' }}>
                {icon}
            </span>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 'bold' : 'normal', textTransform: 'uppercase' }}>
                {label}
            </span>
        </button>
    )
}
