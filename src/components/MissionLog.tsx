import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
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
    const { user } = useUser(); // Cloud User Context

    const [localEditingId, setLocalEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editColor, setEditColor] = useState('');

    // Sync prop with local state if needed (optional, for bubble click)
    useEffect(() => {
        if (editingTaskId) {
            const task = tasks.find(t => t.id === editingTaskId);
            if (task) startEditing(task);
        }
    }, [editingTaskId, tasks]);

    const filteredTasks = tasks.filter(task => {
        return isSameDay(new Date(task.deadline), selectedDate) || task.status === 'completed';
    });

    // Sort: Completed first, then by time
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return -1;
        if (a.status !== 'completed' && b.status === 'completed') return 1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    const startEditing = (task: any) => {
        setLocalEditingId(task.id);
        setEditTitle(task.title);
        const date = new Date(task.deadline);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        setEditTime(`${hours}:${minutes}`);
        setEditColor(task.color || '#3b82f6');
    };

    const cancelEditing = () => {
        setLocalEditingId(null);
        onEditTask(''); // Clear parent state if any
    };

    const saveEdit = () => {
        if (localEditingId) {
            const deadline = new Date(selectedDate);
            const [hours, minutes] = editTime.split(':');
            deadline.setHours(parseInt(hours), parseInt(minutes));

            const updatedTask = {
                title: editTitle,
                deadline,
                color: editColor
            };

            updateTask(localEditingId, updatedTask);

            // Sync Update
            if (user) {
                const fullTask = tasks.find(t => t.id === localEditingId);
                // Merge old task with updates for sync record
                if (fullTask) {
                    MongoService.syncTask({ ...fullTask, ...updatedTask }, user);
                }
            }

            setLocalEditingId(null);
            onEditTask('');
        }
    };



    const handleLaunch = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        const task = tasks.find(t => t.id === id);
        if (task) {
            // Sound FX
            SoundService.playLaunch();

            // Gamification handled in store (xpAwarded check)
            completeTask(id);

            // Sync Completion
            if (user) {
                MongoService.syncTask({ ...task, status: 'completed' }, user);
            }
        }
    };


    const getPriorityColor = (color: string | undefined) => {
        if (color === '#ff4444') return 'border-red-500 text-red-400';
        if (color === '#ffaa00') return 'border-yellow-500 text-yellow-400';
        return 'border-green-500 text-green-400';
    };

    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(5, 5, 16, 0.95)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'auto',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
            }}
        >
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Mission Log
                </h3>
                <span style={{ fontSize: '12px', color: '#60a5fa', fontFamily: 'monospace' }}>{filteredTasks.length} ENTRIES</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }} className="custom-scrollbar">
                {sortedTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px' }}>
                        <div style={{ fontSize: '24px', opacity: 0.5, marginBottom: '10px' }}>∅</div>
                        <p style={{ fontSize: '12px', margin: 0 }}>No active signals.</p>
                        <p style={{ fontSize: '10px', opacity: 0.6 }}>Create a mission to begin.</p>
                    </div>
                ) : (
                    sortedTasks.map(task => (
                        <div
                            key={task.id}
                            className={`transition-all group ${getPriorityColor(task.color)}`}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '20px', // Curved corners
                                marginBottom: '15px', // Separate boxes
                                borderLeft: `4px solid ${task.color || '#3b82f6'}`, // colored indicator
                                border: localEditingId === task.id ? '1px solid #3b82f6' : undefined,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                overflow: 'hidden' // Ensure content doesn't spill out of curves
                            }}
                        >
                            {localEditingId === task.id ? (
                                // EDIT MODE
                                <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px' }}>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontSize: '14px',
                                            padding: '4px',
                                            outline: 'none'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                            type="time"
                                            value={editTime}
                                            onChange={(e) => setEditTime(e.target.value)}
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontSize: '12px',
                                                borderRadius: '4px',
                                                padding: '4px 8px',
                                                outline: 'none'
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {COLORS.map(c => (
                                                <div
                                                    key={c.value}
                                                    onClick={() => setEditColor(c.value)}
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        backgroundColor: c.value,
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        border: editColor === c.value ? '2px solid white' : '2px solid transparent',
                                                        boxShadow: editColor === c.value ? `0 0 10px ${c.value}` : 'none',
                                                        transition: 'all 0.2s'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '5px' }}>
                                        <button
                                            onClick={cancelEditing}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: '#9ca3af',
                                                fontSize: '10px',
                                                textTransform: 'uppercase',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveEdit}
                                            style={{
                                                background: '#3b82f6',
                                                border: 'none',
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
                                            }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // VIEW MODE
                                <div className="p-3">
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#e5e7eb', textAlign: 'center', width: '100%', textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.5 : 1 }}>
                                            {task.title}
                                        </span>
                                        {task.status === 'completed' && <span className="text-green-400 text-xs font-bold" style={{ marginTop: '4px' }}>DONE</span>}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <span style={{ fontSize: '11px', opacity: 0.7, fontFamily: 'monospace', marginLeft: '8px' }}>
                                            {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>

                                        {task.status !== 'completed' ? (
                                            <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => startEditing(task)}
                                                    className="border border-blue-500/30 text-blue-400 hover:text-white hover:bg-blue-500/20"
                                                    style={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                        fontSize: '10px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        transition: 'all 0.2s',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleLaunch(e, task.id)}
                                                    className="bg-gradient-to-r from-orange-600 to-red-600 shadow-lg"
                                                    style={{
                                                        flex: 2,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                        fontSize: '10px',
                                                        fontWeight: 'bold',
                                                        color: 'white',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        padding: '4px 12px',
                                                        borderRadius: '4px',
                                                        transition: 'all 0.2s',
                                                        cursor: 'pointer',
                                                        border: 'none'
                                                    }}
                                                >
                                                    Launch
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    SoundService.playRecall();
                                                    updateTask(task.id, { status: 'active' });
                                                }}
                                                className="border border-white/10 text-gray-400 hover:text-red-400 hover:bg-white/5"
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    fontSize: '10px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer',
                                                    gap: '4px'
                                                }}
                                                title="Undo Launch"
                                            >
                                                Recall ↩
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Gradient fade at bottom for style */}
            <div style={{ height: '40px', background: 'linear-gradient(to top, rgba(5,5,16,1), transparent)', pointerEvents: 'none', position: 'absolute', bottom: 0, left: 0, width: '100%' }}></div>
        </div>
    );
}
