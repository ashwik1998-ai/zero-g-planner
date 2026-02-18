import { useEffect } from 'react';
import { useTaskStore, ACHIEVEMENT_DEFS } from '../store/useTaskStore';

export function AchievementToast() {
    const newAchievement = useTaskStore(s => s.newAchievement);
    const clearNewAchievement = useTaskStore(s => s.clearNewAchievement);

    useEffect(() => {
        if (!newAchievement) return;
        const timer = setTimeout(clearNewAchievement, 4000);
        return () => clearTimeout(timer);
    }, [newAchievement, clearNewAchievement]);

    if (!newAchievement) return null;
    const def = ACHIEVEMENT_DEFS[newAchievement];
    if (!def) return null;

    return (
        <div style={{
            position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, pointerEvents: 'none',
            animation: 'achievementSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
            <style>{`
                @keyframes achievementSlideIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-30px) scale(0.8); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1); }
                }
                @keyframes achievementGlow {
                    0%, 100% { box-shadow: 0 0 30px rgba(251,191,36,0.4), 0 8px 40px rgba(0,0,0,0.6); }
                    50%      { box-shadow: 0 0 60px rgba(251,191,36,0.7), 0 8px 40px rgba(0,0,0,0.6); }
                }
            `}</style>
            <div style={{
                background: 'linear-gradient(135deg, rgba(15,10,5,0.98), rgba(30,20,5,0.98))',
                border: '1px solid rgba(251,191,36,0.6)',
                borderRadius: '16px',
                padding: '16px 24px',
                display: 'flex', alignItems: 'center', gap: '16px',
                fontFamily: 'Inter, system-ui, sans-serif',
                animation: 'achievementGlow 2s ease-in-out infinite',
                minWidth: '320px',
            }}>
                <div style={{
                    fontSize: '36px', lineHeight: 1,
                    filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.8))',
                }}>
                    {def.icon}
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '2px' }}>
                        Achievement Unlocked!
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>
                        {def.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {def.desc}
                    </div>
                </div>
            </div>
        </div>
    );
}
