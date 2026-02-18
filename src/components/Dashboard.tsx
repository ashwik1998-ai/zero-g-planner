import { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { isSameDay, subDays, format, startOfDay } from 'date-fns';

interface DashboardProps {
    onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    work: '#3b82f6',
    personal: '#10b981',
    health: '#f59e0b',
    learning: '#8b5cf6',
    other: '#6b7280',
};

export function Dashboard({ onClose }: DashboardProps) {
    const tasks = useTaskStore(s => s.tasks);
    const xp = useTaskStore(s => s.xp);
    const level = useTaskStore(s => s.level);
    const streak = useTaskStore(s => s.streak);
    const achievements = useTaskStore(s => s.achievements);

    const completed = tasks.filter(t => t.status === 'completed');
    const active = tasks.filter(t => t.status === 'active');
    const today = startOfDay(new Date());

    // Last 7 days bar chart data
    const last7 = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const day = subDays(today, 6 - i);
            const count = completed.filter(t => isSameDay(new Date(t.deadline), day)).length;
            return { label: format(day, 'EEE'), count };
        });
    }, [completed, today]);

    const maxBar = Math.max(...last7.map(d => d.count), 1);

    // Category breakdown
    const catBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        completed.forEach(t => {
            const cat = t.category ?? 'other';
            map[cat] = (map[cat] ?? 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [completed]);

    // Completion rate today
    const todayAll = tasks.filter(t => isSameDay(new Date(t.deadline), today));
    const todayDone = todayAll.filter(t => t.status === 'completed');
    const todayRate = todayAll.length > 0 ? Math.round((todayDone.length / todayAll.length) * 100) : 0;

    // Productivity score color
    const scoreColor = todayRate >= 70 ? '#10b981' : todayRate >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
        }} onClick={onClose}>
            <div style={{
                background: 'rgba(8,8,24,0.99)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: '24px', padding: '32px',
                maxWidth: '700px', width: '95%',
                maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 0 80px rgba(59,130,246,0.12)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>📊 Mission Control</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Your performance overview</p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px',
                        color: '#9ca3af', fontSize: '18px', cursor: 'pointer', padding: '6px 10px',
                    }}>✕</button>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
                    {[
                        { icon: '✅', label: 'Completed', value: completed.length, color: '#10b981' },
                        { icon: '🚀', label: 'Active', value: active.length, color: '#3b82f6' },
                        { icon: '⚡', label: 'Total XP', value: xp.toLocaleString(), color: '#fbbf24' },
                        { icon: '🔥', label: 'Streak', value: `${streak}d`, color: '#f97316' },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            background: 'rgba(255,255,255,0.04)', borderRadius: '14px',
                            padding: '16px', textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.07)',
                        }}>
                            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{stat.icon}</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Bar chart: last 7 days */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Last 7 Days
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
                            {last7.map(d => (
                                <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                                    <div style={{ fontSize: '10px', color: '#6b7280' }}>{d.count || ''}</div>
                                    <div style={{
                                        width: '100%', borderRadius: '4px 4px 0 0',
                                        height: `${(d.count / maxBar) * 60}px`,
                                        minHeight: d.count > 0 ? '4px' : '2px',
                                        background: d.count > 0 ? 'linear-gradient(180deg, #60a5fa, #3b82f6)' : 'rgba(255,255,255,0.06)',
                                        boxShadow: d.count > 0 ? '0 0 8px rgba(59,130,246,0.4)' : 'none',
                                        transition: 'height 0.3s',
                                    }} />
                                    <div style={{ fontSize: '9px', color: '#4b5563' }}>{d.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Today's productivity score */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Today's Score
                        </div>
                        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                            <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 40}
                                    strokeDashoffset={2 * Math.PI * 40 * (1 - todayRate / 100)}
                                    style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${scoreColor})` }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: '22px', fontWeight: 800, color: scoreColor }}>{todayRate}%</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '8px' }}>
                            {todayDone.length} / {todayAll.length} missions
                        </div>
                    </div>
                </div>

                {/* Category breakdown */}
                {catBreakdown.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            By Category
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {catBreakdown.map(([cat, count]) => (
                                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CATEGORY_COLORS[cat] ?? '#6b7280', flexShrink: 0 }} />
                                    <div style={{ fontSize: '12px', color: '#d1d5db', textTransform: 'capitalize', width: '80px' }}>{cat}</div>
                                    <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: '3px',
                                            background: CATEGORY_COLORS[cat] ?? '#6b7280',
                                            width: `${(count / completed.length) * 100}%`,
                                            boxShadow: `0 0 6px ${CATEGORY_COLORS[cat] ?? '#6b7280'}`,
                                        }} />
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', width: '24px', textAlign: 'right' }}>{count}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Level progress */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Level {level} Progress
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {xp % 500} / 500 XP · {achievements.length} badges
                        </div>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: '4px',
                            background: 'linear-gradient(90deg, #fbbf24, #f97316)',
                            width: `${(xp % 500) / 500 * 100}%`,
                            boxShadow: '0 0 10px rgba(251,191,36,0.5)',
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
