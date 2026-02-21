import { create } from 'zustand';
import { EventService } from '../services/EventService';
import type { EventModel } from '../services/EventService';

interface EventStore {
    events: EventModel[];
    loading: boolean;
    initializedForUser: string | null;

    initialize: (userId: string) => Promise<void>;
    addOrUpdateEvent: (event: EventModel, userEmail: string) => Promise<void>;
    deleteEvent: (eventId: string, userId: string) => Promise<void>;
    clearEvents: () => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
    events: [],
    loading: false,
    initializedForUser: null,

    initialize: async (userId: string) => {
        if (get().initializedForUser === userId) return;

        set({ loading: true });
        try {
            const events = await EventService.fetchEvents(userId);
            set({ events, initializedForUser: userId });
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            set({ loading: false });
        }
    },

    addOrUpdateEvent: async (event: EventModel, userEmail: string) => {
        // Optimistic UI update
        const existingEvents = get().events;
        const exists = existingEvents.some(e => e.id === event.id);

        set({
            events: exists
                ? existingEvents.map(e => (e.id === event.id ? event : e))
                : [...existingEvents, event]
        });

        // Background Sync
        try {
            await EventService.syncEvent(event, userEmail);
        } catch (error) {
            console.error('Event sync failed:', error);
            // Optionally could rollback optimistic update here
        }
    },

    deleteEvent: async (eventId: string, userId: string) => {
        // Optimistic UI update
        const existingEvents = get().events;
        set({ events: existingEvents.filter(e => e.id !== eventId) });

        // Background Sync
        try {
            await EventService.deleteEvent(eventId, userId);
        } catch (error) {
            console.error('Event delete failed:', error);
            // Optionally could rollback optimistic update here
            set({ events: existingEvents });
        }
    },

    clearEvents: () => {
        set({ events: [], initializedForUser: null });
    }
}));
