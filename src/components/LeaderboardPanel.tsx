import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

interface LeaderboardEntry {
    userId: string;
    displayName: string;
    avatar: string;
    xp: number;
    level: number;
}

interface LeaderboardPanelProps {
    onClose: () => void;
    currentXp: number;
    currentLevel: number;
}

const API_BASE = 'http://localhost:5000/api';

export function LeaderboardPanel({ onClose, currentXp, currentLevel }: LeaderboardPanelProps) {
    const { user } = useUser();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        // Sync current user's score
        fetch(`${API_BASE}/leaderboard/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                displayName: user.fullName || user.username || 'Commander',
                avatar: user.imageUrl || '',
                xp: currentXp,
                level: currentLevel,
            }),
        }).catch(() => { });

        // Fetch leaderboard
        fetch(`${API_BASE}/leaderboard`)
            .then(r => r.json())
            .then(data => { setEntries(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user, currentXp, currentLevel]);

    const myRank = entries.findIndex(e => e.userId === user?.id) + 1;

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
                maxWidth: '480px', width: '90%',
                maxHeight: '80vh', overflowY: 'auto',
                fontFamily: 'Inter, system-ui, sans-serif',
                boxShadow: '0 0 80px rgba(59,130,246,0.15)',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>
                            🌌 Leaderboard
                        </h2>
                        {myRank > 0 && (
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                                Your rank: <span style={{ color: '#60a5fa', fontWeight: 700 }}>#{myRank}</span>
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px',
                        color: '#9ca3af', fontSize: '18px', cursor: 'pointer', padding: '6px 10px',
                    }}>✕</button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#4b5563', padding: '40px 0' }}>Loading commanders…</div>
                ) : entries.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#4b5563', padding: '40px 0' }}>
                        No commanders yet. Be the first!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {entries.map((entry, idx) => {
                            const isMe = entry.userId === user?.id;
                            const rankColors = ['#fbbf24', '#9ca3af', '#cd7c2f'];
                            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                            return (
                                <div key={entry.userId} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px 16px', borderRadius: '12px',
                                    background: isMe ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                                    border: isMe ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                }}>
                                    {/* Rank */}
                                    <div style={{
                                        width: '28px', textAlign: 'center', fontSize: '14px',
                                        fontWeight: 800, color: rankColors[idx] ?? '#4b5563',
                                        flexShrink: 0,
                                    }}>
                                        {rankEmoji ?? `#${idx + 1}`}
                                    </div>
                                    {/* Avatar */}
                                    {entry.avatar ? (
                                        <img src={entry.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                                            👤
                                        </div>
                                    )}
                                    {/* Name */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: isMe ? 700 : 500, color: isMe ? '#60a5fa' : '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {entry.displayName} {isMe && '(You)'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#4b5563' }}>Level {entry.level}</div>
                                    </div>
                                    {/* XP bar */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>
                                            {entry.xp.toLocaleString()} XP
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
