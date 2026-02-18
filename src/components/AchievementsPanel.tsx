import { useTaskStore, ACHIEVEMENT_DEFS } from '../store/useTaskStore';

interface AchievementsPanelProps {
    onClose: () => void;
}

export function AchievementsPanel({ onClose }: AchievementsPanelProps) {
    const achievements = useTaskStore(s => s.achievements);
    const streak = useTaskStore(s => s.streak);
    const xp = useTaskStore(s => s.xp);
    const level = useTaskStore(s => s.level);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={onClose}>
            <div style={{
                background: 'rgba(8,8,24,0.99)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '24px', padding: '32px',
                maxWidth: '560px', width: '90%',
                maxHeight: '80vh', overflowY: 'auto',
                fontFamily: 'Inter, system-ui, sans-serif',
                boxShadow: '0 0 80px rgba(59,130,246,0.15)',
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>
                            🏆 Achievements
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                            {achievements.length} / {Object.keys(ACHIEVEMENT_DEFS).length} unlocked
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px',
                        color: '#9ca3af', fontSize: '18px', cursor: 'pointer', padding: '6px 10px',
                    }}>✕</button>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Level', value: level, icon: '⭐' },
                        { label: 'Total XP', value: xp.toLocaleString(), icon: '⚡' },
                        { label: 'Streak', value: `${streak}d`, icon: '🔥' },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            background: 'rgba(255,255,255,0.04)', borderRadius: '12px',
                            padding: '14px', textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.07)',
                        }}>
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{stat.value}</div>
                            <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Achievement grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {Object.entries(ACHIEVEMENT_DEFS).map(([key, def]) => {
                        const unlocked = achievements.includes(key);
                        return (
                            <div key={key} style={{
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: unlocked ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                background: unlocked ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.02)',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                transition: 'all 0.2s',
                                opacity: unlocked ? 1 : 0.45,
                            }}>
                                <div style={{
                                    fontSize: '26px', lineHeight: 1, flexShrink: 0,
                                    filter: unlocked ? 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' : 'grayscale(1)',
                                }}>
                                    {def.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: unlocked ? '#fbbf24' : '#6b7280' }}>
                                        {def.label}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                                        {def.desc}
                                    </div>
                                </div>
                                {unlocked && (
                                    <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#10b981' }}>✓</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
