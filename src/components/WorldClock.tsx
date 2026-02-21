import { useState, useEffect } from 'react';
import { getCountryByCode, flagUrl } from '../data/countries';

interface WorldClockProps {
    homeCountryCode?: string; // from Clerk metadata
}

export function WorldClock({ homeCountryCode = 'IN' }: WorldClockProps) {
    const [selectedCode, setSelectedCode] = useState(homeCountryCode);
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');

    const country = getCountryByCode(selectedCode);

    useEffect(() => {
        setSelectedCode(homeCountryCode);
    }, [homeCountryCode]);

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', {
                timeZone: country.tz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            });
            const dateStr = now.toLocaleDateString('en-US', {
                timeZone: country.tz,
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
            setTime(timeStr);
            setDate(dateStr);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [country.tz]);

    return (
        <div style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            padding: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            background: 'rgba(0,0,0,0.2)',
            position: 'relative',
        }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                    <span style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                        World Clock
                    </span>
                </div>
                {/* Country display */}
                <div
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        color: '#d1d5db',
                        fontSize: '11px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 500,
                    }}
                >
                    <img
                        src={flagUrl(country.iso2, '24x18')}
                        alt={country.name}
                        style={{ width: '16px', height: '12px', borderRadius: '2px', objectFit: 'cover' }}
                    />
                    {country.name.split(' (')[0]}
                </div>
            </div>

            {/* Clock display */}
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                    background: 'linear-gradient(90deg, #60a5fa, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                }}>
                    {time}
                </div>
                <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '6px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {date} ·
                    <img
                        src={flagUrl(country.iso2, '24x18')}
                        alt={country.name}
                        style={{ width: '14px', height: '10px', borderRadius: '2px', objectFit: 'cover' }}
                    />
                    {country.name.split(' (')[0]}
                </div>
            </div>
        </div>
    );
}
