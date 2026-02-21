import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { SoundService } from '../services/SoundService';
import { useUser, SignInButton, UserButton } from '@clerk/clerk-react';
import { COUNTRIES, getCountryByCode, flagUrl } from '../data/countries';
import { StreakBadge } from './StreakBadge';
import { NotificationService } from '../services/NotificationService';
import { SidebarMenu } from './SidebarMenu';

interface HeaderProps {
    onChangeBg?: () => void;
    currentBgLabel?: string;
    onToggleDashboard?: () => void;
    onToggleAchievements?: () => void;
    onToggleLeaderboard?: () => void;
    onToggleEvents?: () => void;
    onAbortAll?: () => void;
}

const HOW_TO_USE_CONTENT = [
    { icon: '🪐', title: 'Orbit View', body: 'Your tasks orbit a central sun in 3D space. Closer = more urgent. Angle = time of day. Drag to rotate the view.' },
    { icon: '📅', title: 'Schedule Panel', body: 'Pick a date on the calendar. Click "+ New Mission Protocol" to add a task with title, time, color, and mission.' },
    { icon: '📋', title: 'Mission Log', body: 'See all missions for the selected date. Click "Launch" to complete a mission and earn XP. Click "Edit" to modify.' },
    { icon: '🌟', title: 'XP & Levels', body: 'Complete missions to earn XP. Urgent (red) = 100 XP, Normal (orange) = 50 XP, Casual (green) = 25 XP.' },
    { icon: '🎨', title: 'Themes', body: 'Click the theme button in the header center to cycle through 5 space themes: Deep Space, Nebula Blue, Cosmic Purple...' },
    { icon: '☁️', title: 'Cloud Sync', body: 'Sign in to sync your missions across devices. All data is saved to the cloud automatically when you add or complete.' },
];

// Self-contained — reads useUser() directly so it works inside Clerk's UserProfilePage
function LocationPageContent() {
    const { user } = useUser();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const code = (user?.unsafeMetadata?.nationality as string) ?? 'IN';
    const [selected, setSelected] = useState(code);
    const country = getCountryByCode(selected);

    const handleSave = async () => {
        setSaving(true);
        try {
            await user?.update({ unsafeMetadata: { nationality: selected } });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111827', maxWidth: '480px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>Home Location</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280' }}>
                Sets your timezone for the world clock and the time ring marker.
            </p>

            {/* Current selection card */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px', borderRadius: '12px',
                background: '#f3f4f6', marginBottom: '20px',
                border: '1px solid #e5e7eb',
            }}>
                <img
                    src={flagUrl(country.iso2, '48x36')}
                    alt={country.name}
                    style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{country.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontFamily: 'monospace' }}>{country.tz}</div>
                </div>
            </div>

            {/* Country picker grid */}
            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>
                Change Country
            </div>
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '6px', maxHeight: '240px', overflowY: 'auto',
                marginBottom: '20px', paddingRight: '4px',
            }}>
                {COUNTRIES.map(c => (
                    <div
                        key={c.code}
                        onClick={() => setSelected(c.code)}
                        style={{
                            padding: '9px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: selected === c.code ? '1.5px solid #3b82f6' : '1px solid #e5e7eb',
                            background: selected === c.code ? '#eff6ff' : '#fafafa',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '12px',
                            color: selected === c.code ? '#1d4ed8' : '#374151',
                            fontWeight: selected === c.code ? 600 : 400,
                            transition: 'all 0.15s',
                        }}
                    >
                        <img
                            src={flagUrl(c.iso2, '24x18')}
                            alt={c.name}
                            style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    </div>
                ))}
            </div>

            {/* Save button */}
            <button
                onClick={handleSave}
                disabled={saving || selected === code}
                style={{
                    background: saved ? '#10b981' : (saving || selected === code) ? '#d1d5db' : '#3b82f6',
                    color: 'white', border: 'none', borderRadius: '8px',
                    padding: '10px 24px', fontSize: '13px', fontWeight: 700,
                    cursor: saving || selected === code ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', fontFamily: 'Inter, system-ui, sans-serif',
                }}
            >
                {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Location'}
            </button>
        </div>
    );
}

// Self-contained component for Notifications page
function NotificationsPageContent() {
    const [subscribing, setSubscribing] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = async () => {
        setSubscribing(true);
        try {
            const hasPermission = await NotificationService.requestPermission();
            setSubscribed(hasPermission);
        } catch (e: any) {
            console.error("handleSubscribe error:", e);
        }
        setSubscribing(false);
    };

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111827', maxWidth: '480px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>Push Notifications</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280' }}>
                Enable push notifications to get reminders for your daily missions and special events on this device.
            </p>

            <button
                onClick={handleSubscribe}
                disabled={subscribing || subscribed}
                style={{
                    background: subscribed ? '#10b981' : subscribing ? '#d1d5db' : '#3b82f6',
                    color: 'white', border: 'none', borderRadius: '8px',
                    padding: '10px 24px', fontSize: '13px', fontWeight: 700,
                    cursor: (subscribing || subscribed) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', fontFamily: 'Inter, system-ui, sans-serif',
                }}
            >
                {subscribed ? '✓ Subscribed' : subscribing ? 'Subscribing…' : 'Subscribe to Notifications'}
            </button>
        </div>
    );
}

export function Header({
    onChangeBg,
    currentBgLabel,
    onToggleDashboard,
    onToggleAchievements,
    onToggleLeaderboard,
    onToggleEvents,
    onAbortAll
}: HeaderProps) {
    const { isSignedIn, user } = useUser();
    const xp = useTaskStore(state => state.xp);
    const level = useTaskStore(state => state.level);
    const soundTheme = useTaskStore(state => state.soundTheme);
    const setSoundTheme = useTaskStore(state => state.setSoundTheme);
    const [isMuted, setIsMuted] = useState(SoundService.isMuted);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showHowToUse, setShowHowToUse] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [savingCountry, setSavingCountry] = useState(false);

    const nationalityCode = (user?.unsafeMetadata?.nationality as string) ?? 'IN';
    const homeCountry = getCountryByCode(nationalityCode);

    const handleChangeCountry = async (code: string) => {
        setSavingCountry(true);
        try { await user?.update({ unsafeMetadata: { nationality: code } }); } catch (e) { console.error(e); }
        setSavingCountry(false);
        setShowCountryPicker(false);
    };

    const xpForNextLevel = 500;
    const progress = (xp % xpForNextLevel) / xpForNextLevel * 100;

    const toggleSound = () => {
        const muted = SoundService.toggleMute();
        setIsMuted(muted);
        if (!muted) SoundService.playClick();
    };

    const modalOverlay: React.CSSProperties = {
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    };

    const modalBox: React.CSSProperties = {
        background: 'rgba(8,8,24,0.99)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '20px', padding: '32px',
        maxWidth: '520px', width: '90%', color: 'white',
        boxShadow: '0 0 60px rgba(59,130,246,0.15)',
        fontFamily: 'Inter, system-ui, sans-serif',
        maxHeight: '85vh', overflowY: 'auto',
    };

    return (
        <>
            <div style={{
                height: '64px',
                width: '100%',
                background: 'rgba(5,5,16,0.95)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                boxSizing: 'border-box',
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                padding: '0 24px',
                boxShadow: '0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.4)',
                zIndex: 1000,
                position: 'relative',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}>
                {/* LEFT: Logo + Level + Hamburger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SidebarMenu
                        onToggleDashboard={onToggleDashboard}
                        onToggleLeaderboard={onToggleLeaderboard}
                        onToggleEvents={onToggleEvents}
                        onToggleHowToUse={() => setShowHowToUse(true)}
                    />

                    <span style={{
                        fontSize: '17px', fontWeight: 800, letterSpacing: '-0.5px',
                        background: 'linear-gradient(90deg, #60a5fa, #06b6d4)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        whiteSpace: 'nowrap',
                    }}>
                        Zero-G Planner
                    </span>

                    {/* Level badge */}
                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: '2px',
                        background: 'rgba(59,130,246,0.1)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: '10px', padding: '4px 10px',
                        boxShadow: '0 0 15px rgba(59,130,246,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.5px' }}>
                                {level >= 4 ? 'ACE' : level === 3 ? 'COMMANDER' : level === 2 ? 'PILOT' : 'CADET'}
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)' }}>
                                LVL {level}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', transition: 'width 0.5s', borderRadius: '2px' }} />
                            </div>
                            <span style={{ fontSize: '9px', color: '#6b7280', fontFamily: 'monospace', opacity: 0.8 }}>{xp} / {(Math.floor(xp / 500) + 1) * 500}</span>
                        </div>
                    </div>

                    {/* How to Play — right next to XP badge */}
                    <button
                        onClick={() => { setShowInstructions(true); SoundService.playClick(); }}
                        onMouseEnter={() => SoundService.playHover()}
                        title="Quick Controls"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#4b5563', fontSize: '15px', padding: '4px',
                            borderRadius: '6px', display: 'flex', alignItems: 'center',
                            transition: 'color 0.2s',
                        }}
                    >
                        ℹ️
                    </button>

                    <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

                    <StreakBadge />
                </div>

                {/* CENTER: Feature Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button
                        onClick={() => { onToggleAchievements?.(); SoundService.playClick(); }}
                        title="Achievements (A)"
                        style={{
                            background: 'rgba(168,85,247,0.1)',
                            border: '1px solid rgba(168,85,247,0.2)',
                            cursor: 'pointer', color: '#a855f7',
                            padding: '6px 12px', borderRadius: '12px',
                            fontSize: '12px', fontWeight: 600,
                            transition: 'all 0.2s',
                        }}
                    >
                        🏆
                    </button>

                    <button
                        onClick={() => { onAbortAll?.(); SoundService.playClick(); }}
                        title="Abort All Missions for Selected Date"
                        style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            cursor: 'pointer', color: '#ef4444',
                            padding: '6px 12px', borderRadius: '12px',
                            fontSize: '12px', fontWeight: 600,
                            transition: 'all 0.2s',
                        }}
                    >
                        ⚠️ Abort All
                    </button>

                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

                    {onChangeBg && (
                        <button
                            onClick={() => { onChangeBg(); SoundService.playClick(); }}
                            onMouseEnter={() => SoundService.playHover()}
                            title={`Theme: ${currentBgLabel}`}
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                cursor: 'pointer', color: '#d1d5db',
                                padding: '6px 16px', borderRadius: '24px',
                                fontSize: '12px', fontWeight: 500,
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                            }}
                        >
                            🎨 {currentBgLabel}
                        </button>
                    )}

                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

                    {/* Sound Theme Selector */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <select
                            value={soundTheme}
                            onChange={(e) => {
                                setSoundTheme(e.target.value as any);
                                SoundService.playClick();
                            }}
                            onMouseEnter={() => SoundService.playHover()}
                            title="Audio Theme"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                cursor: 'pointer', color: '#d1d5db',
                                padding: '6px 12px', borderRadius: '24px',
                                fontSize: '12px', fontWeight: 500,
                                transition: 'all 0.2s',
                                appearance: 'none',
                                outline: 'none',
                                fontFamily: 'Inter, system-ui, sans-serif'
                            }}
                        >
                            <option value="default" style={{ background: '#1f2937' }}>🎵 Default</option>
                            <option value="naruto" style={{ background: '#1f2937' }}>🦊 Naruto</option>
                            <option value="onepiece" style={{ background: '#1f2937' }}>🏴‍☠️ One Piece</option>
                            <option value="frieren" style={{ background: '#1f2937' }}>🧝‍♀️ Frieren</option>
                        </select>
                        <span style={{ position: 'absolute', right: '10px', fontSize: '10px', pointerEvents: 'none', color: '#9ca3af' }}>▾</span>
                    </div>

                </div>

                {/* RIGHT: Sound + Auth */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                    {/* Sound */}
                    <button
                        onClick={toggleSound}
                        onMouseEnter={() => SoundService.playHover()}
                        title={isMuted ? 'Unmute' : 'Mute'}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#6b7280', fontSize: '16px', padding: '6px',
                            borderRadius: '8px', display: 'flex', alignItems: 'center',
                        }}
                    >
                        {isMuted ? '🔇' : '🔊'}
                    </button>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

                    {/* Auth */}
                    {isSignedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>

                            {/* Country info card — flag + name + timezone, click to change */}
                            <div style={{ position: 'relative' }}>
                                <div
                                    onClick={() => setShowCountryPicker(v => !v)}
                                    title={`Home: ${homeCountry.name} — click to change`}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '7px',
                                        background: 'rgba(59,130,246,0.12)',
                                        border: '1px solid rgba(59,130,246,0.35)',
                                        borderRadius: '20px', padding: '5px 12px 5px 8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 0 10px rgba(59,130,246,0.15)',
                                    }}
                                >
                                    <img
                                        src={flagUrl(homeCountry.iso2, '32x24')}
                                        alt={homeCountry.name}
                                        style={{ width: '24px', height: '18px', borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                                        <span style={{
                                            fontSize: '12px', fontWeight: 700, color: '#f3f4f6',
                                            fontFamily: 'Inter, system-ui, sans-serif',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {homeCountry.name.split(' (')[0]}
                                        </span>
                                        <span style={{
                                            fontSize: '9px', color: '#6b7280',
                                            fontFamily: 'monospace', letterSpacing: '0.5px',
                                        }}>
                                            {homeCountry.tz.split('/')[1]?.replace(/_/g, ' ') ?? homeCountry.tz}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '9px', color: '#4b5563', marginLeft: '2px' }}>▾</span>
                                </div>

                                {/* Country picker dropdown */}
                                {showCountryPicker && (
                                    <div style={{
                                        position: 'absolute', top: '110%', right: 0,
                                        background: 'rgba(5,5,20,0.99)',
                                        border: '1px solid rgba(59,130,246,0.25)',
                                        borderRadius: '12px', overflow: 'hidden',
                                        zIndex: 2000, width: '210px',
                                        maxHeight: '280px', overflowY: 'auto',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                                        fontFamily: 'Inter, system-ui, sans-serif',
                                    }}>
                                        <div style={{
                                            padding: '9px 14px', fontSize: '10px',
                                            color: '#60a5fa', textTransform: 'uppercase',
                                            letterSpacing: '1.5px', fontWeight: 700,
                                            borderBottom: '1px solid rgba(255,255,255,0.07)',
                                            background: 'rgba(59,130,246,0.06)',
                                        }}>
                                            🌍 Change Country
                                        </div>
                                        {COUNTRIES.map(c => (
                                            <div
                                                key={c.code}
                                                onClick={() => !savingCountry && handleChangeCountry(c.code)}
                                                style={{
                                                    padding: '9px 14px',
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    fontSize: '12px',
                                                    color: nationalityCode === c.code ? '#60a5fa' : '#d1d5db',
                                                    background: nationalityCode === c.code ? 'rgba(59,130,246,0.12)' : 'transparent',
                                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                    transition: 'background 0.15s',
                                                    fontWeight: nationalityCode === c.code ? 600 : 400,
                                                }}
                                            >
                                                <img
                                                    src={flagUrl(c.iso2, '24x18')}
                                                    alt={c.name}
                                                    style={{ width: '20px', height: '15px', borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }}
                                                />
                                                <span style={{ flex: 1 }}>{c.name}</span>
                                                {nationalityCode === c.code && (
                                                    <span style={{ fontSize: '11px', color: '#10b981' }}>✓</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Clerk UserButton avatar with Location tab */}
                            <div onMouseEnter={() => SoundService.playHover()}>
                                <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8' } }}>
                                    <UserButton.UserProfilePage
                                        label="Location"
                                        labelIcon={
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                            </svg>
                                        }
                                        url="location"
                                    >
                                        <LocationPageContent />
                                    </UserButton.UserProfilePage>
                                    <UserButton.UserProfilePage
                                        label="Notifications"
                                        labelIcon={<span style={{ fontSize: '14px', marginLeft: '2px' }}>🔔</span>}
                                        url="notifications"
                                    >
                                        <NotificationsPageContent />
                                    </UserButton.UserProfilePage>
                                </UserButton>
                            </div>
                        </div>

                    ) : (
                        <SignInButton mode="modal">
                            <button
                                onMouseEnter={() => SoundService.playHover()}
                                onClick={() => SoundService.playClick()}
                                style={{
                                    background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                                    border: 'none', cursor: 'pointer', color: 'white',
                                    padding: '7px 18px', borderRadius: '20px',
                                    fontWeight: 700, fontSize: '13px',
                                    boxShadow: '0 0 16px rgba(59,130,246,0.4)',
                                }}
                            >
                                Sign In
                            </button>
                        </SignInButton>
                    )}
                </div>
            </div >

            {/* Quick Controls Modal */}
            {
                showInstructions && (
                    <div style={modalOverlay} onClick={() => setShowInstructions(false)}>
                        <div style={modalBox} onClick={e => e.stopPropagation()}>
                            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, background: 'linear-gradient(90deg, #60a5fa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                🚀 Quick Controls
                            </h2>
                            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '13px' }}>Orbit physics & controls</p>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {[
                                    { icon: '🪐', title: 'Orbit Physics', body: 'Distance = Urgency (closer = more urgent).\nAngle = Time of day (clockwise from top).' },
                                    { icon: '🌟', title: 'XP System', body: 'Complete missions to earn XP.\n🔴 Urgent: 100 XP  🟠 Normal: 50 XP  🟢 Casual: 25 XP' },
                                    { icon: '🎮', title: 'Controls', body: 'Click a planet to edit it.\nDrag to rotate the 3D view.\nMobile: Use bottom tabs to navigate.' },
                                ].map(item => (
                                    <div key={item.title} style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '5px' }}>{item.icon} {item.title}</div>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{item.body}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowInstructions(false)} style={{ marginTop: '20px', width: '100%', padding: '11px', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                                Got it ✓
                            </button>
                        </div>
                    </div>
                )
            }

            {/* How to Use Modal */}
            {
                showHowToUse && (
                    <div style={modalOverlay} onClick={() => setShowHowToUse(false)}>
                        <div style={modalBox} onClick={e => e.stopPropagation()}>
                            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, background: 'linear-gradient(90deg, #60a5fa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                📖 How to Use Zero-G Planner
                            </h2>
                            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '13px' }}>Complete guide to mission control</p>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {HOW_TO_USE_CONTENT.map(item => (
                                    <div key={item.title} style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '5px' }}>{item.icon} {item.title}</div>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: 1.6 }}>{item.body}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowHowToUse(false)} style={{ marginTop: '20px', width: '100%', padding: '11px', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                                Ready to Command 🚀
                            </button>
                        </div>
                    </div>
                )
            }
        </>
    );
}
