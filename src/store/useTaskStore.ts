import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { isSameDay } from 'date-fns';

export interface Task {
    id: string;
    title: string;
    deadline: Date;
    urgency: number; // 1-5 scale
    status: 'active' | 'completed';
    createdAt: Date;
    color?: string; // Hex code or preset name
    description?: string;
    xpAwarded?: boolean;
}

interface TaskState {
    tasks: Task[];
    xp: number;
    level: number;
    addXp: (amount: number) => void;
    addTask: (task: Partial<Task> & { title: string; deadline: Date }) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    completeTask: (id: string) => void;
    removeTask: (id: string) => void;
    deleteTasksByDate: (date: Date) => void;
    setAllStatus: (date: Date, status: 'active' | 'completed') => void;
    setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
    tasks: [
        // Initial dummy data for visualization
        {
            id: uuidv4(),
            title: 'Finish Project Proposal',
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
            urgency: 5,
            status: 'active',
            createdAt: new Date(),
            color: '#ff4444'
        },
        {
            id: uuidv4(),
            title: 'Buy Groceries',
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
            urgency: 2,
            status: 'active',
            createdAt: new Date(),
            color: '#00cc88'
        },
    ],
    xp: 0,
    level: 1,
    addXp: (amount) => set((state) => {
        const newXp = state.xp + amount;
        // Level up every 500 XP (Linear for now)
        const newLevel = Math.floor(newXp / 500) + 1;
        return { xp: newXp, level: newLevel };
    }),
    addTask: (task) =>
        set((state) => ({
            tasks: [
                ...state.tasks,
                {
                    id: uuidv4(),
                    createdAt: new Date(),
                    status: 'active',
                    urgency: 1,
                    color: '#3b82f6',
                    xpAwarded: false,
                    ...task
                },
            ],
        })),
    updateTask: (id, updates) =>
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        })),
    completeTask: (id) =>
        set((state) => {
            // Find task to calculate XP
            const task = state.tasks.find(t => t.id === id);
            if (!task || task.status === 'completed') return {};

            // XP Logic: Only award if not already awarded
            let earnedXp = 0;
            let xpAwarded = task.xpAwarded;

            if (!xpAwarded) {
                // Urgency 5 = 100 XP, 1 = 20 XP
                earnedXp = (task.urgency || 1) * 20;
                xpAwarded = true;
            }

            const newXp = state.xp + earnedXp;
            const newLevel = Math.floor(newXp / 500) + 1;

            return {
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, status: 'completed', xpAwarded } : t
                ),
                xp: newXp,
                level: newLevel
            };
        }),
    removeTask: (id) =>
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
        })),
    deleteTasksByDate: (date: Date) =>
        set((state) => ({
            tasks: state.tasks.filter((t) => !isSameDay(new Date(t.deadline), date)),
        })),
    setAllStatus: (date: Date, status: 'active' | 'completed') =>
        set((state) => {
            // Bonus XP for "Launch All" if active -> completed
            let earnedXp = 0;
            if (status === 'completed') {
                const tasksToComplete = state.tasks.filter(t => isSameDay(new Date(t.deadline), date) && t.status !== 'completed');
                earnedXp = tasksToComplete.reduce((acc, t) => acc + ((t.urgency || 1) * 20), 0);
            }

            const newXp = state.xp + earnedXp;
            const newLevel = Math.floor(newXp / 500) + 1;

            return {
                tasks: state.tasks.map((t) =>
                    isSameDay(new Date(t.deadline), date) ? { ...t, status } : t
                ),
                xp: newXp,
                level: newLevel
            };
        }),
    setTasks: (tasks) => set({ tasks }),
}));
