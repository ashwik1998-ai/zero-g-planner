import { useState, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useEventStore } from '../store/useEventStore';
import type { EventModel } from '../services/EventService';
import { SoundService } from '../services/SoundService';

interface EventsPanelProps {
    onClose: () => void;
}

type PanelView = 'home' | 'form' | 'list';

const CATEGORY_LABELS: Record<EventModel['category'], string> = {
    birthday: '🎂 Birthday',
    meeting: '🤝 Casual Meeting',
    special_day: '🌟 Special Day',
    other: '✨ Other'
};

export function EventsPanel({ onClose }: EventsPanelProps) {
    const { user } = useUser();
    const store = useEventStore();

    // View Management
    const [view, setView] = useState<PanelView>('home');
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(
        new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    );
    const [category, setCategory] = useState<EventModel['category']>('other');
    const [recurrence, setRecurrence] = useState<EventModel['recurrence']>('none');

    // List View States
    const [filterCategory, setFilterCategory] = useState<EventModel['category'] | 'all'>('all');

    // Derived Events
    const sortedEvents = useMemo(() => {
        let evts = [...store.events];
        if (filterCategory !== 'all') {
            evts = evts.filter(e => e.category === filterCategory);
        }
        return evts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [store.events, filterCategory]);

    const openCreateForm = () => {
        setEditingEventId(null);
        setTitle('');
        setDate(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
        setCategory('other');
        setRecurrence('none');
        setView('form');
        SoundService.playClick();
    };

    const openEditForm = (evt: EventModel) => {
        setEditingEventId(evt.id);
        setTitle(evt.title);
        setDate(evt.date); // Preserving ISO datetime string format
        setCategory(evt.category);
        setRecurrence(evt.recurrence);
        setView('form');
        SoundService.playClick();
    };

    const handleSave = () => {
        if (!title.trim() || !user?.emailAddresses[0]?.emailAddress) return;

        const evt: EventModel = {
            id: editingEventId || crypto.randomUUID(),
            title: title.trim(),
            date: date,
            isAllDay: true,
            color: '#a855f7',
            icon: CATEGORY_LABELS[category].split(' ')[0], // Steal emoji from label
            category,
            recurrence
        };

        store.addOrUpdateEvent(evt, user.emailAddresses[0].emailAddress);
        SoundService.playClick();

        // Return to previous context
        if (editingEventId) setView('list');
        else setView('home');
    };

    const handleDelete = (id: string) => {
        if (user?.emailAddresses[0]?.emailAddress) {
            store.deleteEvent(id, user.emailAddresses[0].emailAddress);
            SoundService.playClick();
        }
    };

    return (
        <div style={{
            position: 'absolute', top: '72px', left: '24px',
            width: '380px', maxHeight: 'calc(100vh - 100px)',
            background: 'rgba(5,5,16,0.95)', border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '16px', backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100,
            display: 'flex', flexDirection: 'column', color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif',
            overflow: 'hidden'
        }}>
            {/* HEADER */}
            <div style={{
                padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(90deg, rgba(168,85,247,0.1) 0%, transparent 100%)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {view !== 'home' && (
                        <button
                            onClick={() => { setView('home'); SoundService.playHover(); }}
                            style={{ background: 'none', border: 'none', color: '#d8b4fe', cursor: 'pointer', fontSize: '18px', padding: 0 }}
                        >
                            ←
                        </button>
                    )}
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>📅</span>
                        {view === 'home' ? 'Special Events' : view === 'form' ? (editingEventId ? 'Edit Event' : 'New Event') : 'Existing Events'}
                    </h2>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}>✖</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {view === 'home' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.5, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '12px', borderRadius: '10px' }}>
                            💡 <strong>Pro Tip:</strong> To receive push notifications for your special events, ensure you click <strong>Subscribe to Notifications</strong> in your <strong style={{ color: '#60a5fa' }}>Profile Menu → Notifications</strong> tab!
                        </div>

                        <button
                            onClick={openCreateForm}
                            style={{ width: '100%', background: 'rgba(168,85,247,0.15)', border: '1px dashed rgba(168,85,247,0.4)', color: '#d8b4fe', padding: '16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, transition: 'background 0.2s' }}
                        >
                            <span style={{ fontSize: '18px' }}>+</span> Add Special Event
                        </button>

                        <button
                            onClick={() => { setView('list'); SoundService.playClick(); }}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, transition: 'background 0.2s' }}
                        >
                            📋 View Existing Events ({store.events.length})
                        </button>
                    </div>
                )}

                {view === 'form' && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
                        <input
                            type="text"
                            placeholder="Event Title (e.g., Mom's Birthday)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '12px', boxSizing: 'border-box' }}
                            autoFocus
                        />
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '12px', boxSizing: 'border-box' }}
                        />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as EventModel['category'])}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '12px', boxSizing: 'border-box' }}
                        >
                            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                        <select
                            value={recurrence}
                            onChange={(e) => setRecurrence(e.target.value as any)}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '16px', boxSizing: 'border-box' }}
                        >
                            <option value="none">Does not repeat</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handleSave} style={{ flex: 2, background: '#a855f7', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                {editingEventId ? 'Save Changes' : 'Initialize Event'}
                            </button>
                            <button onClick={() => setView('home')} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {view === 'list' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Filter Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap' }}>Filter:</span>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value as EventModel['category'] | 'all')}
                                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px', borderRadius: '6px', fontSize: '13px' }}
                            >
                                <option value="all">All Events</option>
                                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {store.loading && <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>Initializing sensors...</div>}

                        {!store.loading && sortedEvents.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#6b7280', padding: '30px 20px', fontSize: '13px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                No events found in this star system.
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {sortedEvents.map(event => (
                                <div key={event.id} style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{event.icon} {event.title}</div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                            {new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                        {event.recurrence !== 'none' && (
                                            <div style={{ marginTop: '6px', display: 'inline-block', background: 'rgba(168,85,247,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#d8b4fe' }}>
                                                Repeats {event.recurrence}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button onClick={() => openEditForm(event)} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(event.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete">
                                            ✖
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
