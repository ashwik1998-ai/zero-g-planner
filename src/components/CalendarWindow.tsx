import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTaskStore } from '../store/useTaskStore';
import './CalendarWindow.css';
import { isSameDay } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import { MongoService } from '../services/MongoService';

interface CalendarWindowProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export function CalendarWindow({ selectedDate, onDateChange }: CalendarWindowProps) {
    const deleteTasksByDate = useTaskStore(state => state.deleteTasksByDate);
    const addTask = useTaskStore(state => state.addTask);
    const setAllStatus = useTaskStore(state => state.setAllStatus);
    const tasks = useTaskStore(state => state.tasks);
    const { user } = useUser(); // Get Clerk user context

    const [missionTitle, setMissionTitle] = useState('');
    const [missionTime, setMissionTime] = useState('12:00');
    const [missionColor, setMissionColor] = useState('#3b82f6');
    const [newUrgency, setNewUrgency] = useState<number>(1); // Added newUrgency state

    // Check if there are tasks for the selected date
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
            description: ''
        };

        addTask(newTask);

        // Trigger Cloud Sync (Mock/Real)
        if (user) {
            // Adapt Clerk user to match service expectation (or update service)
            // For now, passing full Clerk UserResource
            MongoService.syncTask({ ...newTask, status: 'active', id: 'pending-sync' }, user);
        }

        // Reset form
        setMissionTitle('');
        setMissionColor('#3b82f6');
        setMissionTime('12:00');
        setNewUrgency(1);
    }

    const handleDeleteAll = () => {
        if (confirm(`Are you sure you want to delete ALL missions for ${selectedDate.toLocaleDateString()}?`)) {
            deleteTasksByDate(selectedDate);
        }
    }

    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(5, 5, 16, 0.95)',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'auto',
                boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
            }}
        >
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block', boxShadow: '0 0 10px #3b82f6' }}></span>
                    Schedule
                </h2>
            </div>

            <div style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
                <Calendar
                    onChange={(value) => onDateChange(value as Date)}
                    value={selectedDate}
                    className="sci-fi-calendar condensed"
                />
            </div>

            {/* Abort Action - Movable Position */}
            {hasTasksForDate && (
                <div style={{ padding: '0 15px 15px 15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setAllStatus(selectedDate, allCompleted ? 'active' : 'completed');
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: allCompleted ? 'rgba(59, 130, 246, 0.2)' : 'linear-gradient(90deg, #10b981, #3b82f6)',
                            color: 'white',
                            border: allCompleted ? '1px solid rgba(59, 130, 246, 0.5)' : 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            transition: 'all 0.2s',
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        className="hover:scale-[1.02] active:scale-95"
                    >
                        {allCompleted ? (
                            <>↩ Recall All Missions</>
                        ) : (
                            <>🚀 Launch All Missions</>
                        )}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAll();
                        }}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(220, 38, 38, 0.2)', // Red background
                            color: '#ffada5',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            transition: 'all 0.2s',
                            boxShadow: '0 0 10px rgba(220, 38, 38, 0.2)'
                        }}
                        className="hover:bg-red-900/40 hover:scale-[1.02] active:scale-95"
                    >
                        ⚠️ Abort All Missions
                    </button>
                </div>
            )}

            {/* Mission Protocol Form */}
            <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                    New Mission Protocol
                </div>

                <input
                    type="text"
                    placeholder="Mission Objective..."
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        padding: '8px',
                        color: 'white',
                        fontSize: '12px',
                        marginBottom: '8px',
                        outline: 'none'
                    }}
                />

                <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                    <input
                        type="time"
                        value={missionTime}
                        onChange={(e) => setMissionTime(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            padding: '6px',
                            color: 'white',
                            fontSize: '11px',
                            outline: 'none'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {['#ff4444', '#ffaa00', '#00cc88'].map(color => (
                            <div
                                key={color}
                                onClick={() => setMissionColor(color)}
                                style={{
                                    width: '24px',
                                    height: '100%',
                                    background: color,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    border: missionColor === color ? '2px solid white' : 'none',
                                    opacity: missionColor === color ? 1 : 0.5
                                }}
                            />
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleAddMission}
                    style={{
                        width: '100%',
                        padding: '8px',
                        background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    Initialize
                </button>
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ color: '#9ca3af', textAlign: 'center', fontSize: '10px', fontFamily: 'monospace' }}>
                    LOG: {selectedDate.toLocaleDateString()}
                </div>


            </div>
        </div>
    );
}
