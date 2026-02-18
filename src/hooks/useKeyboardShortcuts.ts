import { useEffect } from 'react';

interface ShortcutHandlers {
    onNewMission?: () => void;
    onTogglePause?: () => void;
    onDashboard?: () => void;
    onAchievements?: () => void;
    onLeaderboard?: () => void;
    onClose?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
    useEffect(() => {
        const handle = (e: KeyboardEvent) => {
            // Don't fire when typing in an input/textarea
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            switch (e.key.toLowerCase()) {
                case 'n': handlers.onNewMission?.(); break;
                case ' ': e.preventDefault(); handlers.onTogglePause?.(); break;
                case 'd': handlers.onDashboard?.(); break;
                case 'a': handlers.onAchievements?.(); break;
                case 'l': handlers.onLeaderboard?.(); break;
                case 'escape': handlers.onClose?.(); break;
            }
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [handlers]);
}
