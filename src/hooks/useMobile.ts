import { useState, useEffect } from 'react';

export function useMobile(breakpoint = 1024) {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < breakpoint;
    });

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const onChange = () => setIsMobile(mql.matches);

        mql.addEventListener('change', onChange);
        setIsMobile(mql.matches); // Initial check

        return () => mql.removeEventListener('change', onChange);
    }, [breakpoint]);

    return isMobile;
}
