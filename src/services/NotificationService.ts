export class NotificationService {
    private static timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
    private static permission: NotificationPermission = 'default';

    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return true;
        }
        const result = await Notification.requestPermission();
        this.permission = result;
        return result === 'granted';
    }

    static scheduleForTask(taskId: string, title: string, deadline: Date): void {
        // Cancel existing timer for this task
        this.cancelForTask(taskId);

        const msUntilDeadline = deadline.getTime() - Date.now();
        const msUntilAlert = msUntilDeadline - 15 * 60 * 1000; // 15 min before

        if (msUntilAlert <= 0 || this.permission !== 'granted') return;

        const timer = setTimeout(() => {
            new Notification('🚀 Mission Alert — Zero-G Planner', {
                body: `"${title}" launches in 15 minutes!`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: taskId,
            });
            this.timers.delete(taskId);
        }, msUntilAlert);

        this.timers.set(taskId, timer);
    }

    static cancelForTask(taskId: string): void {
        const timer = this.timers.get(taskId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(taskId);
        }
    }

    static cancelAll(): void {
        this.timers.forEach(t => clearTimeout(t));
        this.timers.clear();
    }

    static scheduleAll(tasks: { id: string; title: string; deadline: Date; status: string }[]): void {
        tasks
            .filter(t => t.status === 'active' && new Date(t.deadline) > new Date())
            .forEach(t => this.scheduleForTask(t.id, t.title, new Date(t.deadline)));
    }
}
