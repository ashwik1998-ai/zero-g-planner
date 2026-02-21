

export interface EventModel {
    id: string;
    title: string;
    date: string; // ISO String
    isAllDay: boolean;
    color: string;
    icon: string;
    category: 'birthday' | 'meeting' | 'special_day' | 'other';
    recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const EventService = {
    async fetchEvents(userId: string): Promise<EventModel[]> {
        const res = await fetch(`${API_BASE_URL}/events?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch events');
        return res.json();
    },

    async syncEvent(event: EventModel, userEmail: string): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/events/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, user: { email: userEmail } })
        });
        if (!res.ok) throw new Error('Failed to sync event');
    },

    async deleteEvent(eventId: string, userId: string): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/events/${eventId}?userId=${userId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete event');
    }
};
