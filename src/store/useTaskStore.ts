import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { isSameDay, isYesterday } from 'date-fns';

export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'other';
export type Recurrence = 'daily' | 'weekly' | 'monthly' | null;

export interface Subtask {
    id: string;
    text: string;
    done: boolean;
}

export interface Task {
    id: string;
    title: string;
    deadline: Date;
    urgency: number; // 1-5 scale
    status: 'active' | 'completed';
    createdAt: Date;
    color?: string;
    description?: string;
    xpAwarded?: boolean;
    category?: TaskCategory;
    recurrence?: Recurrence;
    subtasks?: Subtask[];
    groupId?: string;
    completionNote?: string;
}

export const ACHIEVEMENT_DEFS: Record<string, { label: string; desc: string; icon: string }> = {
    first_mission: { label: 'First Launch', desc: 'Complete your first mission', icon: '🚀' },
    missions_10: { label: 'Veteran', desc: 'Complete 10 missions', icon: '🎖️' },
    missions_50: { label: 'Elite Operative', desc: 'Complete 50 missions', icon: '⭐' },
    missions_100: { label: 'Legend', desc: 'Complete 100 missions', icon: '🏆' },
    streak_3: { label: 'On Fire', desc: '3-day mission streak', icon: '🔥' },
    streak_7: { label: 'Week Warrior', desc: '7-day mission streak', icon: '💫' },
    streak_30: { label: 'Iron Commander', desc: '30-day mission streak', icon: '🛡️' },
    night_owl: { label: 'Night Owl', desc: 'Complete a mission after 10 PM', icon: '🦉' },
    speed_demon: { label: 'Speed Demon', desc: 'Complete a mission in under 1 minute', icon: '⚡' },
    level_5: { label: 'Rising Star', desc: 'Reach Level 5', icon: '🌟' },
    level_10: { label: 'Commander', desc: 'Reach Level 10', icon: '👨‍🚀' },
    all_categories: { label: 'Renaissance', desc: 'Complete tasks in all 5 categories', icon: '🎨' },
};

interface TaskState {
    tasks: Task[];
    xp: number;
    level: number;
    streak: number;
    lastCompletedDate: string | null; // ISO date string
    achievements: string[]; // achievement keys
    newAchievement: string | null; // for toast notification
    addXp: (amount: number) => void;
    addTask: (task: Partial<Task> & { title: string; deadline: Date }) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    completeTask: (id: string) => void;
    removeTask: (id: string) => void;
    deleteTasksByDate: (date: Date) => void;
    setAllStatus: (date: Date, status: 'active' | 'completed') => void;
    setTasks: (tasks: Task[]) => void;
    clearNewAchievement: () => void;
    addSubtask: (taskId: string, text: string) => void;
    toggleSubtask: (taskId: string, subtaskId: string) => void;
    removeSubtask: (taskId: string, subtaskId: string) => void;
    setUserData: (data: { xp: number; level: number; streak: number; achievements: string[]; lastCompletedDate: string | null }) => void;
}

function checkAchievements(
    tasks: Task[],
    _xp: number,
    level: number,
    streak: number,
    existing: string[],
    justCompleted: Task
): string | null {
    const completed = tasks.filter(t => t.status === 'completed');
    const count = completed.length;
    const hour = new Date(justCompleted.deadline).getHours();
    const timeSinceCreated = Date.now() - new Date(justCompleted.createdAt).getTime();
    const categoriesUsed = new Set(completed.map(t => t.category).filter(Boolean));

    const candidates: string[] = [];
    if (count >= 1) candidates.push('first_mission');
    if (count >= 10) candidates.push('missions_10');
    if (count >= 50) candidates.push('missions_50');
    if (count >= 100) candidates.push('missions_100');
    if (streak >= 3) candidates.push('streak_3');
    if (streak >= 7) candidates.push('streak_7');
    if (streak >= 30) candidates.push('streak_30');
    if (hour >= 22) candidates.push('night_owl');
    if (timeSinceCreated < 60000) candidates.push('speed_demon');
    if (level >= 5) candidates.push('level_5');
    if (level >= 10) candidates.push('level_10');
    if (categoriesUsed.size >= 5) candidates.push('all_categories');

    const newOne = candidates.find(k => !existing.includes(k));
    return newOne ?? null;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: [],
            xp: 0,
            level: 1,
            streak: 0,
            lastCompletedDate: null,
            achievements: [],
            newAchievement: null,

            clearNewAchievement: () => set({ newAchievement: null }),

            addXp: (amount) => set((state) => {
                const newXp = state.xp + amount;
                const newLevel = Math.floor(newXp / 500) + 1;
                return { xp: newXp, level: newLevel };
            }),

            addTask: (task) =>
                set((state) => {
                    const newTask = {
                        id: task.id || uuidv4(),
                        createdAt: new Date(),
                        status: 'active' as const,
                        urgency: 1,
                        color: '#3b82f6',
                        xpAwarded: false,
                        subtasks: [],
                        ...task,
                    };
                    return { tasks: [...state.tasks, newTask] };
                }),

            updateTask: (id, updates) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                })),

            completeTask: (id) =>
                set((state: TaskState) => {
                    const task = state.tasks.find((t) => t.id === id);
                    if (!task) return {};

                    // If already completed, toggle back to active (Recall) and DEDUCT XP
                    if (task.status === 'completed') {
                        let deductedXp = 0;
                        if (task.xpAwarded) {
                            deductedXp = (task.urgency || 1) * 20;
                        }
                        const newXp = Math.max(0, state.xp - deductedXp);
                        const newLevel = Math.floor(newXp / 500) + 1;

                        const updatedTasks = state.tasks.map(t =>
                            t.id === id ? { ...t, status: 'active' as const, xpAwarded: false } : t
                        );

                        return {
                            tasks: updatedTasks,
                            xp: newXp,
                            level: newLevel,
                        };
                    }

                    // If active, mark as completed and ADD XP (if not already awarded)
                    let earnedXp = 0;
                    let xpAwarded = task.xpAwarded || false;

                    if (!xpAwarded) {
                        earnedXp = (task.urgency || 1) * 20;
                        xpAwarded = true;
                    }
                    const newXp = state.xp + earnedXp;
                    const newLevel = Math.floor(newXp / 500) + 1;

                    // Streak Logic
                    const today = new Date().toDateString();
                    const last = state.lastCompletedDate;
                    let newStreak = state.streak;
                    if (last !== today) {
                        if (last && isYesterday(new Date(last))) {
                            newStreak = state.streak + 1;
                        } else {
                            newStreak = 1;
                        }
                    }

                    // Update Task
                    const updatedTasks = state.tasks.map((t) =>
                        t.id === id ? { ...t, status: 'completed' as const, xpAwarded } : t
                    );

                    // Recurring Logic
                    const recurringAdditions: Task[] = [];
                    if (task.recurrence) {
                        const next = new Date(task.deadline);
                        if (task.recurrence === 'daily') next.setDate(next.getDate() + 1);
                        if (task.recurrence === 'weekly') next.setDate(next.getDate() + 7);
                        if (task.recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
                        recurringAdditions.push({
                            ...task,
                            id: uuidv4(), // New ID for next instance
                            deadline: next,
                            createdAt: new Date(),
                            status: 'active' as const,
                            xpAwarded: false,
                        });
                    }

                    // Achievement Check
                    const allTasks = [...updatedTasks, ...recurringAdditions];
                    const newAch = checkAchievements(allTasks, newXp, newLevel, newStreak, state.achievements, task);
                    const achievements = newAch ? [...state.achievements, newAch] : state.achievements;

                    return {
                        tasks: [...updatedTasks, ...recurringAdditions],
                        xp: newXp,
                        level: newLevel,
                        streak: newStreak,
                        lastCompletedDate: today,
                        achievements,
                        newAchievement: newAch,
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
                    let earnedXp = 0;
                    if (status === 'completed') {
                        const tasksToComplete = state.tasks.filter(t =>
                            isSameDay(new Date(t.deadline), date) && t.status !== 'completed'
                        );
                        earnedXp = tasksToComplete.reduce((acc, t) => acc + ((t.urgency || 1) * 20), 0);
                    }
                    const newXp = state.xp + earnedXp;
                    const newLevel = Math.floor(newXp / 500) + 1;
                    return {
                        tasks: state.tasks.map((t) =>
                            isSameDay(new Date(t.deadline), date) ? { ...t, status } : t
                        ),
                        xp: newXp,
                        level: newLevel,
                    };
                }),

            setTasks: (tasks) => set(() => {
                const completedMissions = tasks.filter(t => t.status === 'completed' && t.xpAwarded);
                const calculatedXp = completedMissions.reduce((acc, t) => acc + ((t.urgency || 1) * 20), 0);
                const newLevel = Math.floor(calculatedXp / 500) + 1;
                return { tasks, xp: calculatedXp, level: newLevel };
            }),

            addSubtask: (taskId, text) =>
                set((state) => ({
                    tasks: state.tasks.map(t =>
                        t.id === taskId
                            ? { ...t, subtasks: [...(t.subtasks ?? []), { id: uuidv4(), text, done: false }] }
                            : t
                    ),
                })),

            toggleSubtask: (taskId, subtaskId) =>
                set((state) => ({
                    tasks: state.tasks.map(t =>
                        t.id === taskId
                            ? {
                                ...t,
                                subtasks: (t.subtasks ?? []).map(s =>
                                    s.id === subtaskId ? { ...s, done: !s.done } : s
                                ),
                            }
                            : t
                    ),
                })),

            removeSubtask: (taskId, subtaskId) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId && t.subtasks
                            ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
                            : t
                    ),
                })),

            setUserData: (data) =>
                set(() => ({
                    xp: data.xp,
                    level: data.level,
                    streak: data.streak,
                    achievements: data.achievements,
                    lastCompletedDate: data.lastCompletedDate,
                })),
        }),
        {
            name: 'zero-g-planner-store',
            partialize: (state) => ({
                tasks: state.tasks,
                xp: state.xp,
                level: state.level,
                streak: state.streak,
                lastCompletedDate: state.lastCompletedDate,
                achievements: state.achievements,
            }),
        }
    )
);

