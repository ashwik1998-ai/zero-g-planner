const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const MongoService = {
    // 1. Sync Task (Create or Update)
    syncTask: async (task: any, user: any) => {
        if (!user) return;

        try {
            const response = await fetch(`${API_URL}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task,
                    user: {
                        email: user.primaryEmailAddress?.emailAddress,
                        name: user.fullName
                    }
                }),
            });

            if (!response.ok) throw new Error('Sync failed');
            const data = await response.json();
            console.log('[Mongo] ✅ Synced:', data.mission.title);
            return data;

        } catch (error) {
            console.error('[Mongo] ❌ Sync Error:', error);
            return { error };
        }
    },

    // 2. Fetch User Missions
    fetchMissions: async (user: any) => {
        if (!user) return [];

        const email = user.primaryEmailAddress?.emailAddress;
        try {
            const response = await fetch(`${API_URL}/missions?userId=${email}`);
            if (!response.ok) throw new Error('Fetch failed');

            const data = await response.json();
            console.log(`[Mongo] 📥 Fetched ${data.missions.length} missions`);
            return data.missions;

        } catch (error) {
            console.error('[Mongo] ❌ Fetch Error:', error);
            return [];
        }
    }
};
