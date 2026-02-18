import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTaskStore } from '../store/useTaskStore';
import type { TaskCategory } from '../store/useTaskStore';
import './CalendarWindow.css';
import { isSameDay } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import { MongoService } from '../services/MongoService';
import { WorldClock } from './WorldClock';

interface CalendarWindowProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const MISSION_COLORS = ['#ff4444', '#ffaa00', '#00cc88'];

export function CalendarWindow({ selectedDate, onDateChange }: CalendarWindowProps) {
    const deleteTasksByDate = useTaskStore(state => state.deleteTasksByDate);
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
        const newTask = {
            title: missionTitle,
            deadline,
            urgency: newUrgency,
            color: missionColor,
            description: missionDescription,
            category: missionCategory,
            subtasks: [],
            recurrence: null
        };
        addTask(newTask);
        if (user) MongoService.syncTask({ ...newTask, status: 'active', id: 'pending-sync' }, user);
        setMissionTitle('');
        setMissionColor('#00cc88');
        setMissionTime('12:00');
        setMissionDescription('');
        setNewUrgency(1);
        setShowForm(false);
    };

    const handleSyncAll = (targetStatus: 'active' | 'completed') => {
        setAllStatus(selectedDate, targetStatus);
        if (user) {
            const tasksToSync = tasks.filter(t => isSameDay(new Date(t.deadline), selectedDate));
            tasksToSync.forEach(t => MongoService.syncTask({ ...t, status: targetStatus }, user));
        }
    };

    const handleDeleteAll = () => {
        if (window.confirm('Are you sure you want to abort all missions for this date?')) {
            const tasksToDelete = tasks.filter(t => isSameDay(new Date(t.deadline), selectedDate));
            deleteTasksByDate(selectedDate);
            if (user) MongoService.deleteTasksByDate(tasksToDelete);
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

                {/* Abort All — always shown when tasks exist */}
                {hasTasksForDate && (
                    <button
                        onClick={e => { e.stopPropagation(); handleDeleteAll(); }}
                        style={{
                            ...btnBase,
                            background: 'rgba(220,38,38,0.08)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            color: '#fca5a5',
                            fontSize: '11px',
                        }}
                    >
                        ⚠️ Abort All Missions
                    </button>
                )}
            </div>

            {/* New Mission Form */}
            {showForm && (
                <div style={{
                    padding: '16px 14px',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(0,0,0,0.3)',
                    overflowY: 'auto',
                }}>
                    <div style={{ fontSize: '10px', color: '#60a5fa', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                        Mission Objective
                    </div>

                    {/* Title */}
                    <input
                        type="text"
                        placeholder="Mission title..."
                        value={missionTitle}
                        onChange={e => setMissionTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddMission()}
                        autoFocus
                        style={{ ...inputStyle, marginBottom: '10px' }}
                    />

                    {/* Time + Color */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                        <input
                            type="time"
                            value={missionTime}
                            onChange={e => setMissionTime(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', padding: '7px 10px',
                                color: 'white', fontSize: '12px', outline: 'none',
                                fontFamily: 'Inter, system-ui, sans-serif',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '6px' }}>
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

                    {/* Category Selection */}
                    <div style={{ marginBottom: '12px', position: 'relative' }}>
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
                            marginBottom: '12px',
                            resize: 'vertical',
                            minHeight: '70px',
                            lineHeight: 1.5,
                        }}
                    />

                    <button
                        onClick={handleAddMission}
                        style={{
                            ...btnBase,
                            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                            color: 'white',
                            boxShadow: '0 0 16px rgba(59,130,246,0.3)',
                        }}
                    >
                        Initialize Mission
                    </button>
                </div>
            )}

            {/* World Clock */}
            <WorldClock homeCountryCode={(user?.unsafeMetadata?.nationality as string) ?? 'IN'} />
        </div>
    );
}

