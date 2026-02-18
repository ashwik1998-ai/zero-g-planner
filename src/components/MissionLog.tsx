import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { TaskCategory, Recurrence, Subtask } from '../store/useTaskStore';
import { isSameDay } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import { MongoService } from '../services/MongoService';
import { SoundService } from '../services/SoundService';

interface MissionLogProps {
    selectedDate: Date;
    onEditTask: (id: string) => void;
    editingTaskId?: string | null;
}

const COLORS = [
    { value: '#ff4444', label: 'Red' },
    { value: '#ffaa00', label: 'Orange' },
    { value: '#00cc88', label: 'Green' },
];

export function MissionLog({ selectedDate, onEditTask, editingTaskId }: MissionLogProps) {
    const tasks = useTaskStore(state => state.tasks);
    const updateTask = useTaskStore(state => state.updateTask);
    const completeTask = useTaskStore(state => state.completeTask);
    const removeTask = useTaskStore(state => state.removeTask);
    const { user } = useUser();

    const [localEditingId, setLocalEditingId] = useState<string | null>(null); // Added missing state
    const [editTitle, setEditTitle] = useState(''); // Added missing state
    const [editTime, setEditTime] = useState(''); // Added missing state
    const [editColor, setEditColor] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState<TaskCategory>('work');
    const [editRecurrence, setEditRecurrence] = useState<Recurrence | 'none'>('none');
    const [editSubtasks, setEditSubtasks] = useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = useState('');

    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [showRecurrenceMenu, setShowRecurrenceMenu] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (editingTaskId) {
            const task = tasks.find(t => t.id === editingTaskId);
            if (task) startEditing(task);
        }
    }, [editingTaskId, tasks]);

    const filteredTasks = tasks.filter(task => isSameDay(new Date(task.deadline), selectedDate));
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return -1;
        if (a.status !== 'completed' && b.status === 'completed') return 1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    const startEditing = (task: any) => {
        setLocalEditingId(task.id);
        setEditTitle(task.title);
        const date = new Date(task.deadline);
        setEditTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
        setEditColor(task.color || '#3b82f6');
        setEditDescription(task.description || '');
        setEditCategory(task.category || 'work');
        setEditRecurrence(task.recurrence || 'none');
        setEditSubtasks(task.subtasks || []);
        setExpandedId(null); // close expanded view when editing
    };

    const cancelEditing = () => { setLocalEditingId(null); onEditTask(''); };

    const saveEdit = () => {
        if (localEditingId) {
            const deadline = new Date(selectedDate);
            const [hours, minutes] = editTime.split(':');
            deadline.setHours(parseInt(hours), parseInt(minutes));
            const updatedFields: any = {
                title: editTitle,
                deadline,
                color: editColor,
                description: editDescription,
                category: editCategory,
                recurrence: (editRecurrence === 'none' ? null : editRecurrence) as Recurrence,
                subtasks: editSubtasks
            };
            updateTask(localEditingId, updatedFields);
            if (user) {
                const fullTask = tasks.find(t => t.id === localEditingId);
                if (fullTask) MongoService.syncTask({ ...fullTask, ...updatedFields }, user);
            }
            setLocalEditingId(null);
            onEditTask('');
        }
    };

    const addLocalSubtask = () => {
        if (!newSubtask.trim()) return;
        setEditSubtasks([...editSubtasks, { id: Math.random().toString(36).substr(2, 9), text: newSubtask, done: false }]);
        setNewSubtask('');
    };

    const toggleLocalSubtask = (sid: string) => {
        setEditSubtasks(editSubtasks.map(s => s.id === sid ? { ...s, done: !s.done } : s));
    };

    const removeLocalSubtask = (sid: string) => {
        setEditSubtasks(editSubtasks.filter(s => s.id !== sid));
    };

    const handleLaunch = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const task = tasks.find(t => t.id === id);
        if (task) {
            SoundService.playLaunch();
            completeTask(id);
            if (user) MongoService.syncTask({ ...task, status: 'completed' }, user);
        }
    };

    const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
    const totalCount = filteredTasks.length;

    const inputStyle: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '8px', padding: '8px 10px',
        color: 'white', fontSize: '13px', outline: 'none',
        fontFamily: 'Inter, system-ui, sans-serif',
    };

    return (
        <div style={{
            height: '100%', width: '100%',
            background: 'rgba(5,5,16,0.97)',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column',
            pointerEvents: 'auto',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            {/* Header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px #06b6d4' }} />
                            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                Mission Log
                            </h3>
                        </div>
                        <span style={{ fontSize: '12px', color: '#4b5563' }}>
                            {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                    </div>

                    {totalCount > 0 && (
                        <div style={{
                            padding: '4px 10px', borderRadius: '20px',
                            background: completedCount === totalCount ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.1)',
                            border: `1px solid ${completedCount === totalCount ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.2)'}`,
                            fontSize: '11px', fontWeight: 700,
                            color: completedCount === totalCount ? '#34d399' : '#60a5fa',
                            whiteSpace: 'nowrap',
                        }}>
                            {completedCount}/{totalCount}
                        </div>
                    )}
                </div>

                {totalCount > 0 && (
                    <div style={{ marginTop: '12px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${(completedCount / totalCount) * 100}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                            borderRadius: '2px', transition: 'width 0.5s',
                        }} />
                    </div>
                )}
            </div>

            {/* Task List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
                {sortedTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}>🛸</div>
                        <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 4px', fontWeight: 600 }}>No missions scheduled</p>
                        <p style={{ fontSize: '12px', color: '#374151', margin: 0 }}>Add a mission using the calendar panel</p>
                    </div>
                ) : (
                    sortedTasks.map(task => {
                        const isEditing = localEditingId === task.id;
                        const isDone = task.status === 'completed';
                        const isExpanded = expandedId === task.id;
                        const taskColor = task.color || '#3b82f6';
                        const hasDescription = task.description && task.description.trim().length > 0;

                        return (
                            <div
                                key={task.id}
                                style={{
                                    background: isEditing
                                        ? 'rgba(59,130,246,0.08)'
                                        : isDone ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                                    borderRadius: '14px',
                                    marginBottom: '10px',
                                    border: isEditing
                                        ? '1px solid rgba(59,130,246,0.4)'
                                        : '1px solid rgba(255,255,255,0.06)',
                                    borderLeft: `3px solid ${isDone ? 'rgba(255,255,255,0.1)' : taskColor}`,
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                    boxShadow: isDone ? 'none' : '0 2px 12px rgba(0,0,0,0.2)',
                                }}
                            >
                                {isEditing ? (
                                    /* ── EDIT MODE ── */
                                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* Title */}
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={e => setEditTitle(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                            autoFocus
                                            placeholder="Mission title..."
                                            style={inputStyle}
                                        />

                                        {/* Time + Color */}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="time"
                                                value={editTime}
                                                onChange={e => setEditTime(e.target.value)}
                                                style={{ ...inputStyle, flex: 1 }}
                                            />
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                {COLORS.map(c => (
                                                    <div
                                                        key={c.value}
                                                        onClick={() => setEditColor(c.value)}
                                                        style={{
                                                            width: '22px', height: '22px',
                                                            background: c.value, borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            border: editColor === c.value ? '2px solid white' : '2px solid transparent',
                                                            boxShadow: editColor === c.value ? `0 0 8px ${c.value}` : 'none',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Category + Recurrence */}
                                        <div style={{ display: 'flex', gap: '8px', zIndex: 10 }}>
                                            <div style={{ flex: 1, position: 'relative' }}>
                                                <div style={{ fontSize: '10px', color: '#6366f1', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Category</div>
                                                <div
                                                    onClick={() => {
                                                        setShowCategoryMenu(!showCategoryMenu);
                                                        setShowRecurrenceMenu(false);
                                                    }}
                                                    style={{
                                                        ...inputStyle, padding: '10px 12px', cursor: 'pointer',
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '12px' }}>
                                                        {editCategory === 'work' && '💼 Work'}
                                                        {editCategory === 'personal' && '🏠 Personal'}
                                                        {editCategory === 'health' && '🏥 Health'}
                                                        {editCategory === 'learning' && '📚 Learning'}
                                                        {editCategory === 'other' && '✨ Other'}
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
                                                                    setEditCategory(cat);
                                                                    setShowCategoryMenu(false);
                                                                }}
                                                                style={{
                                                                    padding: '10px 12px', color: 'white', fontSize: '12px', cursor: 'pointer',
                                                                    background: editCategory === cat ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                                                }}
                                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'}
                                                                onMouseLeave={e => e.currentTarget.style.background = editCategory === cat ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
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

                                            <div style={{ flex: 1, position: 'relative' }}>
                                                <div style={{ fontSize: '10px', color: '#6366f1', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Recurrence</div>
                                                <div
                                                    onClick={() => {
                                                        setShowRecurrenceMenu(!showRecurrenceMenu);
                                                        setShowCategoryMenu(false);
                                                    }}
                                                    style={{
                                                        ...inputStyle, padding: '10px 12px', cursor: 'pointer',
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '12px' }}>
                                                        {editRecurrence === 'daily' && '🔁 Daily'}
                                                        {editRecurrence === 'weekly' && '🔁 Weekly'}
                                                        {editRecurrence === 'monthly' && '🔁 Monthly'}
                                                        {(!editRecurrence || editRecurrence === 'none') && '🚀 Once'}
                                                    </span>
                                                    <span style={{ fontSize: '10px', transform: showRecurrenceMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                                                </div>

                                                {showRecurrenceMenu && (
                                                    <div style={{
                                                        position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '5px',
                                                        background: 'rgba(10, 10, 30, 0.98)', border: '1px solid rgba(59, 130, 246, 0.4)',
                                                        borderRadius: '10px', overflow: 'hidden', zIndex: 100, backdropFilter: 'blur(20px)',
                                                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
                                                    }}>
                                                        {[
                                                            { value: 'none', label: '🚀 Once only' },
                                                            { value: 'daily', label: '🔁 Daily orbit' },
                                                            { value: 'weekly', label: '🔁 Weekly orbit' },
                                                            { value: 'monthly', label: '🔁 Monthly orbit' }
                                                        ].map(rec => (
                                                            <div
                                                                key={rec.value}
                                                                onClick={() => {
                                                                    setEditRecurrence(rec.value === 'none' ? null : rec.value as any);
                                                                    setShowRecurrenceMenu(false);
                                                                }}
                                                                style={{
                                                                    padding: '10px 12px', color: 'white', fontSize: '12px', cursor: 'pointer',
                                                                    background: (editRecurrence || 'none') === rec.value ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                                                }}
                                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'}
                                                                onMouseLeave={e => e.currentTarget.style.background = (editRecurrence || 'none') === rec.value ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                                                            >
                                                                {rec.label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Subtasks */}
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Mission Objectives (Subtasks)</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
                                                {editSubtasks.map(s => (
                                                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px' }}>
                                                        <input type="checkbox" checked={s.done} onChange={() => toggleLocalSubtask(s.id)} />
                                                        <span style={{ flex: 1, fontSize: '12px', color: s.done ? '#4b5563' : '#d1d5db', textDecoration: s.done ? 'line-through' : 'none' }}>{s.text}</span>
                                                        <button onClick={() => removeLocalSubtask(s.id)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <input
                                                    type="text"
                                                    value={newSubtask}
                                                    onChange={e => setNewSubtask(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && addLocalSubtask()}
                                                    placeholder="Add objective..."
                                                    style={{ ...inputStyle, flex: 1 }}
                                                />
                                                <button onClick={addLocalSubtask} style={{ background: 'rgba(59,130,246,0.2)', border: 'none', borderRadius: '8px', color: '#60a5fa', padding: '0 12px', cursor: 'pointer' }}>+</button>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                                Briefing (Description)
                                            </div>
                                            <textarea
                                                value={editDescription}
                                                onChange={e => setEditDescription(e.target.value)}
                                                placeholder="Mission briefing, notes, objectives..."
                                                rows={2}
                                                style={{
                                                    ...inputStyle,
                                                    resize: 'vertical',
                                                    minHeight: '50px',
                                                    lineHeight: 1.5,
                                                }}
                                            />
                                        </div>

                                        {/* Save / Cancel */}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={cancelEditing}
                                                style={{
                                                    flex: 1, padding: '7px',
                                                    background: 'transparent',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px', color: '#6b7280',
                                                    fontSize: '11px', fontWeight: 600,
                                                    textTransform: 'uppercase', letterSpacing: '0.5px',
                                                    cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveEdit}
                                                style={{
                                                    flex: 2, padding: '7px',
                                                    background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                                                    border: 'none', borderRadius: '8px',
                                                    color: 'white', fontSize: '11px', fontWeight: 700,
                                                    textTransform: 'uppercase', letterSpacing: '0.5px',
                                                    cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
                                                    boxShadow: '0 0 12px rgba(59,130,246,0.3)',
                                                }}
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── VIEW MODE ── */
                                    <div style={{ padding: '12px 14px' }}>
                                        {/* Title row */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                            <div style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                background: isDone ? 'rgba(255,255,255,0.2)' : taskColor,
                                                boxShadow: isDone ? 'none' : `0 0 6px ${taskColor}`,
                                                marginTop: '4px', flexShrink: 0,
                                            }} />
                                            <div style={{ flex: 1 }}>
                                                <span style={{
                                                    fontSize: '13px', fontWeight: 600,
                                                    color: isDone ? '#4b5563' : '#e5e7eb',
                                                    textDecoration: isDone ? 'line-through' : 'none',
                                                    lineHeight: 1.4, display: 'block',
                                                }}>
                                                    {task.title}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '11px', color: '#374151', fontFamily: 'monospace' }}>
                                                        {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {task.category && (
                                                        <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#4b5563', textTransform: 'capitalize', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            {task.category}
                                                        </span>
                                                    )}
                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                        <span style={{ fontSize: '9px', color: '#3b82f6', fontWeight: 700 }}>
                                                            {task.subtasks.filter((s: { done: boolean }) => s.done).length}/{task.subtasks.length} OBJECTIVES
                                                        </span>
                                                    )}
                                                    {task.recurrence && (task.recurrence as any) !== 'none' && (
                                                        <span title={`Repeats ${task.recurrence}`} style={{ fontSize: '11px', color: '#fb923c' }}>🔁</span>
                                                    )}
                                                    {isDone && <span style={{ color: '#34d399', fontWeight: 700, fontSize: '10px' }}>✓ DONE</span>}
                                                    {(hasDescription || (task.subtasks && task.subtasks.length > 0)) && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : task.id); }}
                                                            style={{
                                                                background: 'none', border: 'none', cursor: 'pointer',
                                                                color: '#4b5563', fontSize: '10px', padding: '0',
                                                                fontFamily: 'Inter, system-ui, sans-serif',
                                                                display: 'flex', alignItems: 'center', gap: '3px',
                                                            }}
                                                        >
                                                            {isExpanded ? '🔼 hide' : '🔽 details'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded view (Description + Subtasks) */}
                                        {isExpanded && (
                                            <div style={{ margin: '0 0 10px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {hasDescription && (
                                                    <div style={{
                                                        padding: '10px 12px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        border: '1px solid rgba(255,255,255,0.06)',
                                                        borderRadius: '8px',
                                                        fontSize: '12px', color: '#9ca3af',
                                                        lineHeight: 1.6, whiteSpace: 'pre-wrap',
                                                    }}>
                                                        {task.description}
                                                    </div>
                                                )}
                                                {task.subtasks && task.subtasks.length > 0 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {task.subtasks.map((s: any) => (
                                                            <div
                                                                key={s.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const news = (task.subtasks || []).map((st: any) => st.id === s.id ? { ...st, done: !st.done } : st);
                                                                    updateTask(task.id, { subtasks: news });
                                                                    if (user) MongoService.syncTask({ ...task, subtasks: news }, user);
                                                                }}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '2px 0' }}
                                                            >
                                                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid currentColor', color: s.done ? '#34d399' : '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {s.done && <span style={{ fontSize: '9px' }}>✓</span>}
                                                                </div>
                                                                <span style={{ fontSize: '12px', color: s.done ? '#4b5563' : '#9ca3af', textDecoration: s.done ? 'line-through' : 'none' }}>{s.text}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        {!isDone ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Abort this mission? Data will be permanently removed from orbit.')) {
                                                            removeTask(task.id);
                                                            MongoService.deleteTask(task.id);
                                                            SoundService.playClick();
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '6px 10px',
                                                        background: 'rgba(255,68,68,0.1)',
                                                        border: '1px solid rgba(255,68,68,0.2)',
                                                        borderRadius: '8px', color: '#ff4444',
                                                        fontSize: '11px', fontWeight: 600,
                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                        fontFamily: 'Inter, system-ui, sans-serif',
                                                    }}
                                                    title="Abort Mission"
                                                >
                                                    🗑️
                                                </button>
                                                <button
                                                    onClick={() => startEditing(task)}
                                                    style={{
                                                        flex: 1, padding: '6px 10px',
                                                        background: 'rgba(255,255,255,0.04)',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '8px', color: '#9ca3af',
                                                        fontSize: '11px', fontWeight: 600,
                                                        textTransform: 'uppercase', letterSpacing: '0.5px',
                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                        fontFamily: 'Inter, system-ui, sans-serif',
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={e => handleLaunch(e, task.id)}
                                                    style={{
                                                        flex: 2, padding: '6px 10px',
                                                        background: 'linear-gradient(90deg, #f97316, #ef4444)',
                                                        border: 'none', borderRadius: '8px',
                                                        color: 'white', fontSize: '11px', fontWeight: 700,
                                                        textTransform: 'uppercase', letterSpacing: '0.5px',
                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                        fontFamily: 'Inter, system-ui, sans-serif',
                                                        boxShadow: '0 0 12px rgba(239,68,68,0.25)',
                                                    }}
                                                >
                                                    🚀 Launch
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    SoundService.playRecall();
                                                    updateTask(task.id, { status: 'active' });
                                                    if (user) MongoService.syncTask({ ...task, status: 'active' }, user);
                                                }}
                                                style={{
                                                    width: '100%', padding: '6px 10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                    borderRadius: '8px', color: '#4b5563',
                                                    fontSize: '11px', fontWeight: 600,
                                                    textTransform: 'uppercase', letterSpacing: '0.5px',
                                                    cursor: 'pointer', transition: 'all 0.2s',
                                                    fontFamily: 'Inter, system-ui, sans-serif',
                                                }}
                                                title="Undo Launch"
                                            >
                                                ↩ Recall Mission
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Gradient fade */}
            <div style={{ height: '40px', background: 'linear-gradient(to top, rgba(5,5,16,1), transparent)', pointerEvents: 'none', position: 'absolute', bottom: 0, left: 0, width: '100%' }} />
        </div>
    );
}
