import { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';

interface HeatmapCalendarProps {
    onDayClick?: (date: Date) => void;
}

const WEEKS = 26; // ~6 months
const DAYS = 7;

function getIntensity(count: number): string {
    if (count === 0) return 'rgba(255,255,255,0.04)';
    if (count === 1) return 'rgba(59,130,246,0.25)';
    if (count === 2) return 'rgba(59,130,246,0.45)';
    if (count === 3) return 'rgba(59,130,246,0.65)';
    return 'rgba(59,130,246,0.9)';
}

export function HeatmapCalendar({ onDayClick }: HeatmapCalendarProps) {
    const tasks = useTaskStore(s => s.tasks);

    // Build a map of date -> completed count
    const countMap = useMemo(() => {
        const map: Record<string, number> = {};
        tasks.filter(t => t.status === 'completed').forEach(t => {
            const key = startOfDay(new Date(t.deadline)).toISOString();
            map[key] = (map[key] ?? 0) + 1;
        });
        return map;
    }, [tasks]);

    // Build grid: WEEKS columns × 7 rows, ending today
    const today = startOfDay(new Date());
    const totalDays = WEEKS * DAYS;
    const startDate = subDays(today, totalDays - 1);

    // Align to Sunday
    const startDow = startDate.getDay(); // 0=Sun
    const grid: (Date | null)[][] = [];
    for (let w = 0; w < WEEKS; w++) {
        const col: (Date | null)[] = [];
        for (let d = 0; d < DAYS; d++) {
            const dayIndex = w * DAYS + d - startDow;
            if (dayIndex < 0 || dayIndex >= totalDays) { col.push(null); continue; }
            col.push(subDays(today, totalDays - 1 - dayIndex));
        }
        grid.push(col);
    }

    const totalCompleted = tasks.filter(t => t.status === 'completed').length;
    const thisWeekCompleted = tasks.filter(t =>
        t.status === 'completed' && isSameDay(new Date(t.deadline), today)
    ).length;

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#d1d5db' }}>Mission Activity</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#4b5563' }}>
                        {totalCompleted} missions completed · {thisWeekCompleted} today
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#4b5563' }}>
                    Less
                    {[0, 1, 2, 3, 4].map(n => (
                        <div key={n} style={{ width: '10px', height: '10px', borderRadius: '2px', background: getIntensity(n) }} />
                    ))}
                    More
                </div>
            </div>

            {/* Day labels */}
            <div style={{ display: 'flex', marginBottom: '4px', paddingLeft: '28px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ width: '13px', fontSize: '8px', color: '#374151', textAlign: 'center', marginRight: '2px' }}>{d[0]}</div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '2px', overflowX: 'auto' }}>
                {/* Month labels + grid */}
                {grid.map((col, wi) => {
                    const firstDay = col.find(d => d !== null);
                    const showMonth = firstDay && firstDay.getDate() <= 7;
                    return (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ height: '12px', fontSize: '8px', color: '#374151', textAlign: 'center' }}>
                                {showMonth && firstDay ? format(firstDay, 'MMM') : ''}
                            </div>
                            {col.map((day, di) => {
                                if (!day) return <div key={di} style={{ width: '11px', height: '11px' }} />;
                                const key = startOfDay(day).toISOString();
                                const count = countMap[key] ?? 0;
                                const isToday = isSameDay(day, today);
                                return (
                                    <div
                                        key={di}
                                        title={`${format(day, 'MMM d, yyyy')}: ${count} mission${count !== 1 ? 's' : ''}`}
                                        onClick={() => onDayClick?.(day)}
                                        style={{
                                            width: '11px', height: '11px', borderRadius: '2px',
                                            background: getIntensity(count),
                                            cursor: onDayClick ? 'pointer' : 'default',
                                            outline: isToday ? '1px solid rgba(59,130,246,0.8)' : 'none',
                                            transition: 'transform 0.1s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.4)')}
                                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
