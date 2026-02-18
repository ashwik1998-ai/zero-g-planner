import { useTaskStore } from '../store/useTaskStore';

export function StreakBadge() {
    const streak = useTaskStore(s => s.streak);

    if (streak === 0) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: '12px',
            padding: '2px 8px',
            color: '#fb923c',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'default',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 0 10px rgba(249,115,22,0.1)',
            animation: streak >= 3 ? 'streakPulse 2s infinite' : 'none',
        }}>
            <style>{`
                @keyframes streakPulse {
                    0%, 100% { box-shadow: 0 0 5px rgba(249,115,22,0.2); transform: scale(1); }
                    50% { box-shadow: 0 0 15px rgba(249,115,22,0.5); transform: scale(1.05); }
                }
            `}</style>
            <span style={{ fontSize: '12px' }}>🔥</span>
            <span>{streak}d</span>
        </div>
    );
}
