import { useState, useEffect, useRef } from 'react';
import type { Task } from '../store/useTaskStore';
import { SoundService } from '../services/SoundService';

interface PomodoroTimerProps {
    task: Task;
    onClose: () => void;
    onComplete: () => void;
}

const WORK_MINS = 25;
const BREAK_MINS = 5;

export function PomodoroTimer({ task, onClose, onComplete }: PomodoroTimerProps) {
    const [phase, setPhase] = useState<'work' | 'break'>('work');
    const [secondsLeft, setSecondsLeft] = useState(WORK_MINS * 60);
    const [running, setRunning] = useState(true);
    const [cycles, setCycles] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalSeconds = phase === 'work' ? WORK_MINS * 60 : BREAK_MINS * 60;
    const progress = 1 - secondsLeft / totalSeconds;
    const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const secs = (secondsLeft % 60).toString().padStart(2, '0');

    // Circumference of SVG circle
    const R = 80;
    const circ = 2 * Math.PI * R;

    useEffect(() => {
        if (!running) return;
        intervalRef.current = setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) {
                    SoundService.playClick();
                    if (phase === 'work') {
                        setCycles(c => c + 1);
                        setPhase('break');
                        return BREAK_MINS * 60;
                    } else {
                        setPhase('work');
                        return WORK_MINS * 60;
                    }
                }
                return s - 1;
            });
        }, 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running, phase]);

    const phaseColor = phase === 'work' ? '#3b82f6' : '#10b981';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 4000,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            {/* Phase badge */}
            <div style={{
                fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700,
                color: phaseColor, marginBottom: '12px',
                padding: '4px 14px', borderRadius: '20px',
                background: `${phaseColor}22`, border: `1px solid ${phaseColor}44`,
            }}>
                {phase === 'work' ? '🚀 Focus Mode' : '☕ Break Time'}
            </div>

            {/* Mission title */}
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '40px', maxWidth: '400px', textAlign: 'center' }}>
                {task.title}
            </div>

            {/* Circular timer */}
            <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '40px' }}>
                <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
                    {/* Progress */}
                    <circle
                        cx="100" cy="100" r={R} fill="none"
                        stroke={phaseColor} strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={circ * progress}
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                        filter={`drop-shadow(0 0 8px ${phaseColor})`}
                    />
                </svg>
                {/* Time display */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{ fontSize: '42px', fontWeight: 800, fontFamily: 'monospace', color: '#fff', letterSpacing: '2px' }}>
                        {mins}:{secs}
                    </div>
                    <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '4px' }}>
                        Cycle {cycles + 1}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button
                    onClick={() => setRunning(r => !r)}
                    style={{
                        background: phaseColor, border: 'none', borderRadius: '12px',
                        color: '#fff', fontSize: '14px', fontWeight: 700,
                        padding: '12px 28px', cursor: 'pointer',
                        boxShadow: `0 0 20px ${phaseColor}66`,
                    }}
                >
                    {running ? '⏸ Pause' : '▶ Resume'}
                </button>
                <button
                    onClick={() => { setPhase(p => p === 'work' ? 'break' : 'work'); setSecondsLeft(phase === 'work' ? BREAK_MINS * 60 : WORK_MINS * 60); }}
                    style={{
                        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px', color: '#9ca3af', fontSize: '14px',
                        padding: '12px 20px', cursor: 'pointer',
                    }}
                >
                    ⏭ Skip
                </button>
            </div>

            {/* Complete / Close */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={onComplete}
                    style={{
                        background: '#10b981', border: 'none', borderRadius: '10px',
                        color: '#fff', fontSize: '13px', fontWeight: 700,
                        padding: '10px 22px', cursor: 'pointer',
                    }}
                >
                    ✓ Complete Mission
                </button>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', color: '#6b7280', fontSize: '13px',
                        padding: '10px 22px', cursor: 'pointer',
                    }}
                >
                    ✕ Exit Focus
                </button>
            </div>
        </div>
    );
}
