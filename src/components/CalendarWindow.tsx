import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTaskStore } from '../store/useTaskStore';
import type { TaskCategory } from '../store/useTaskStore';
import './CalendarWindow.css';
import { isSameDay } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import { MongoService } from '../services/MongoService';
import { v4 as uuidv4 } from 'uuid';
import { WorldClock } from './WorldClock';

interface CalendarWindowProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const MISSION_COLORS = ['#ff4444', '#ffaa00', '#00cc88'];

export function CalendarWindow({ selectedDate, onDateChange }: CalendarWindowProps) {
    const addTask = useTaskStore(state => state.addTask);
    const setAllStatus = useTaskStore(state => state.setAllStatus);
    const tasks = useTaskStore(state => state.tasks);
    const { user } = useUser();

    const [missionTitle, setMissionTitle] = useState('');
    const [missionTime, setMissionTime] = useState('12:00');
    const [missionColor, setMissionColor] = useState('#00cc88');
    const [missionDescription, setMissionDescription] = useState('');
    const [missionCategory, setMissionCategory] = useState<TaskCategory>('work');
    const [newUrgency, setNewUrgency] = useState<number>(1);
    const [reminderOffset, setReminderOffset] = useState<number>(0);
    const [showForm, setShowForm] = useState(false);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);

    const tasksForDate = tasks.filter(t => isSameDay(new Date(t.deadline), selectedDate));
    const hasTasksForDate = tasksForDate.length > 0;
    const allCompleted = hasTasksForDate && tasksForDate.every(t => t.status === 'completed');

    const handleAddMission = async () => {
        if (!missionTitle.trim()) return;
        const deadline = new Date(selectedDate);
        const [hours, minutes] = missionTime.split(':');
        deadline.setHours(parseInt(hours), parseInt(minutes));
        // Pre-generate the ID so we can sync the EXACT same ID to MongoDB
        const newId = uuidv4();
        const newTask = {
            id: newId,
            title: missionTitle,
            deadline,
            urgency: newUrgency,
            color: missionColor,
            description: missionDescription,
            category: missionCategory,
            subtasks: [],
            recurrence: null,
            status: 'active' as const,
            xpAwarded: false,
            createdAt: new Date(),
            reminderOffset,
        };
        addTask(newTask);
        if (user) MongoService.syncTask(newTask, user);
        setMissionTitle('');
        setMissionColor('#00cc88');
        setMissionTime('12:00');
        setMissionDescription('');
        setNewUrgency(1);
        setReminderOffset(0);
        setShowForm(false);
    };

    const handleSyncAll = (targetStatus: 'active' | 'completed') => {
        setAllStatus(selectedDate, targetStatus);
        if (user) {
            const tasksToSync = tasks.filter(t => isSameDay(new Date(t.deadline), selectedDate));
            tasksToSync.forEach(t => MongoService.syncTask({ ...t, status: targetStatus, xpAwarded: targetStatus === 'completed' }, user));
        }
    };


    const btnBase: React.CSSProperties = {
        width: '100%', padding: '10px 14px', borderRadius: '12px',
        cursor: 'pointer', fontWeight: 700, fontSize: '12px',
        textTransform: 'uppercase', letterSpacing: '0.8px',
        transition: 'all 0.2s', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px', border: 'none',
        fontFamily: 'Inter, system-ui, sans-serif',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '9px 12px',
        color: 'white', fontSize: '13px',
        outline: 'none',
        fontFamily: 'Inter, system-ui, sans-serif',
        transition: 'border-color 0.2s',
    };

    return (
        <div style={{
            height: '100%', width: '100%',
            background: 'rgba(5,5,16,0.97)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column',
            pointerEvents: 'auto',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            {/* Header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
                    <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Schedule
                    </h2>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#4b5563' }}>
                    {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Calendar — scrollable, shrinks to fit */}
            <div style={{ padding: '12px', overflowY: 'auto', minHeight: 0, flex: '1 1 auto' }}>
                <Calendar
                    onChange={(value) => onDateChange(value as Date)}
                    value={selectedDate}
                    className="sci-fi-calendar condensed"
                />
            </div>

            {/* Bottom Actions — always visible */}
            <div style={{ padding: '0 14px 14px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* New Mission Toggle */}
                <button
                    onClick={() => setShowForm(v => !v)}
                    style={{
                        ...btnBase,
                        background: showForm
                            ? 'rgba(59,130,246,0.1)'
                            : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                        border: showForm ? '1px solid rgba(59,130,246,0.35)' : 'none',
                        color: 'white',
                        boxShadow: showForm ? 'none' : '0 0 20px rgba(59,130,246,0.25)',
                    }}
                >
                    {showForm ? '✕ Cancel' : '＋ New Mission Protocol'}
                </button>

                {/* Launch All / Recall All — always shown when tasks exist */}
                {hasTasksForDate && (
                    <button
                        onClick={e => { e.stopPropagation(); handleSyncAll(allCompleted ? 'active' : 'completed'); }}
                        style={{
                            ...btnBase,
                            background: allCompleted ? 'rgba(59,130,246,0.1)' : 'linear-gradient(90deg, #10b981, #3b82f6)',
                            border: allCompleted ? '1px solid rgba(59,130,246,0.3)' : 'none',
                            color: 'white',
                            boxShadow: allCompleted ? 'none' : '0 0 16px rgba(16,185,129,0.25)',
                        }}
                    >
                        {allCompleted ? '↩ Recall All Missions' : '🚀 Launch All Missions'}
                    </button>
                )}
            </div>

            {/* New Mission Form Modal */}
            {showForm && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowForm(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
                    />

                    {/* Modal Box - Appears to the right of the sidebar */}
                    <div style={{
                        position: 'absolute',
                        top: '100px',
                        left: 'calc(100% + 15px)',
                        width: '320px',
                        background: 'rgba(5,5,20,0.98)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: '20px',
                        padding: '24px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 30px rgba(59,130,246,0.1)',
                        zIndex: 1001,
                        animation: 'modalFadeIn 0.3s ease-out forwards',
                        fontFamily: 'Inter, system-ui, sans-serif',
                    }}>
                        <style>
                            {`
                                @keyframes modalFadeIn {
                                    from { opacity: 0; transform: translateX(-10px); }
                                    to { opacity: 1; transform: translateX(0); }
                                }
                            `}
                        </style>

                        <div style={{ fontSize: '11px', color: '#60a5fa', marginBottom: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Mission Objective</span>
                            <span
                                onClick={() => setShowForm(false)}
                                style={{ cursor: 'pointer', opacity: 0.6 }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                            >✕</span>
                        </div>

                        {/* Title */}
                        <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                            Objective Title
                        </div>
                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            value={missionTitle}
                            onChange={e => setMissionTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddMission()}
                            autoFocus
                            style={{ ...inputStyle, marginBottom: '16px' }}
                        />

                        {/* Time + Color */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                    Launch Time
                                </div>
                                <input
                                    type="time"
                                    value={missionTime}
                                    onChange={e => setMissionTime(e.target.value)}
                                    style={{
                                        ...inputStyle,
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.05)',
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1, textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                    Priority Color
                                </div>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    {MISSION_COLORS.map(color => (
                                        <div
                                            key={color}
                                            onClick={() => setMissionColor(color)}
                                            style={{
                                                width: '26px', height: '26px',
                                                background: color, borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: missionColor === color ? '2px solid white' : '2px solid transparent',
                                                opacity: missionColor === color ? 1 : 0.45,
                                                boxShadow: missionColor === color ? `0 0 10px ${color}` : 'none',
                                                transition: 'all 0.2s',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reminder Offset selection */}
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                Reminder Protocol
                            </div>
                            <select
                                value={reminderOffset.toString()}
                                onChange={e => setReminderOffset(parseInt(e.target.value))}
                                style={{
                                    ...inputStyle,
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px top 50%',
                                    backgroundSize: '10px auto',
                                }}
                            >
                                <option value="0" style={{ background: '#1f2937' }}>🔔 At time of event</option>
                                <option value="30" style={{ background: '#1f2937' }}>🔔 30 minutes before</option>
                                <option value="60" style={{ background: '#1f2937' }}>🔔 1 hour before</option>
                                <option value="120" style={{ background: '#1f2937' }}>🔔 2 hours before</option>
                            </select>
                        </div>

                        {/* Category Selection */}
                        <div style={{ marginBottom: '16px', position: 'relative' }}>
                            <div style={{ fontSize: '10px', color: '#6366f1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                                Category
                            </div>
                            <div
                                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                                style={{
                                    background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '10px', padding: '10px 12px', color: 'white',
                                    fontSize: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <span>
                                    {missionCategory === 'work' && '💼 Work / Mission'}
                                    {missionCategory === 'personal' && '🏠 Personal / Life'}
                                    {missionCategory === 'health' && '🏥 Health / Fitness'}
                                    {missionCategory === 'learning' && '📚 Learning / Skill'}
                                    {missionCategory === 'other' && '✨ Other / Misc'}
                                </span>
                                <span style={{ fontSize: '10px', transform: showCategoryMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                            </div>

                            {showCategoryMenu && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '5px',
                                    background: 'rgba(10, 10, 30, 0.98)', border: '1px solid rgba(59, 130, 246, 0.4)',
                                    borderRadius: '10px', overflow: 'hidden', zIndex: 100, backdropFilter: 'blur(20px)',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
                                }}>
                                    {(['work', 'personal', 'health', 'learning', 'other'] as TaskCategory[]).map(cat => (
                                        <div
                                            key={cat}
                                            onClick={() => {
                                                setMissionCategory(cat);
                                                setShowCategoryMenu(false);
                                            }}
                                            style={{
                                                padding: '10px 12px', color: 'white', fontSize: '12px', cursor: 'pointer',
                                                background: missionCategory === cat ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'}
                                            onMouseLeave={e => e.currentTarget.style.background = missionCategory === cat ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                                        >
                                            {cat === 'work' && '💼 Work / Mission'}
                                            {cat === 'personal' && '🏠 Personal / Life'}
                                            {cat === 'health' && '🏥 Health / Fitness'}
                                            {cat === 'learning' && '📚 Learning / Skill'}
                                            {cat === 'other' && '✨ Other / Misc'}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mission Details */}
                        <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                            Mission Details (optional)
                        </div>
                        <textarea
                            placeholder="Add mission briefing, notes, or objectives..."
                            value={missionDescription}
                            onChange={e => setMissionDescription(e.target.value)}
                            rows={3}
                            style={{
                                ...inputStyle,
                                marginBottom: '20px',
                                resize: 'vertical',
                                minHeight: '70px',
                            }}
                        />

                        <button
                            onClick={handleAddMission}
                            style={{
                                ...btnBase,
                                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                                color: 'white',
                                boxShadow: '0 0 16px rgba(59,130,246,0.3)',
                                padding: '12px',
                            }}
                        >
                            Initialize Mission
                        </button>
                    </div>
                </>
            )}

            {/* World Clock */}
            <WorldClock homeCountryCode={(user?.unsafeMetadata?.nationality as string) ?? 'IN'} />
        </div>
    );
}

