import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { useTaskStore } from './store/useTaskStore';
import type { TaskCategory } from './store/useTaskStore';
import { TaskBubble } from './components/TaskBubble';
import { TimeRing } from './components/TimeRing';
import { Header } from './components/Header';
import { CalendarWindow } from './components/CalendarWindow';
import { MissionLog } from './components/MissionLog';
import { LandingPage } from './components/LandingPage';
import { isSameDay } from 'date-fns';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import { useMobile } from './hooks/useMobile';
import { MobileNavBar } from './components/MobileNavBar';
import { MongoService } from './services/MongoService';
import { COUNTRIES, getCountryByCode, flagUrl } from './data/countries';
import { AchievementToast } from './components/AchievementToast';
import { AchievementsPanel } from './components/AchievementsPanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { Dashboard } from './components/Dashboard';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AsteroidBelt } from './components/AsteroidBelt';
import { CategoryRing } from './components/CategoryRing';
import { ConstellationLines } from './components/ConstellationLines';
import { BlackHole } from './components/BlackHole';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { NotificationService } from './services/NotificationService';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key in .env file");
}

const BACKGROUNDS = [
  { color: '#050510', fog: '#050510', label: '🌌 Deep Space' },
  { color: '#0a0a2e', fog: '#0a0a2e', label: '🔵 Nebula Blue' },
  { color: '#0d0a1a', fog: '#0d0a1a', label: '🟣 Cosmic Purple' },
  { color: '#0a1a0a', fog: '#0a1a0a', label: '🟢 Aurora Green' },
  { color: '#1a0a0a', fog: '#1a0a0a', label: '🔴 Red Dwarf' },
];

// Cloud sync component
function DataSync() {
  const { user } = useUser();
  const setTasks = useTaskStore((state) => state.setTasks);

  useEffect(() => {
    if (user) {
      console.log('🔄 Fetching user missions...');
      MongoService.fetchMissions(user).then((missions: any[]) => {
        if (missions && missions.length > 0) {
          const parsedMissions = missions.map((m: any) => ({
            id: m.taskId,
            title: m.title,
            deadline: new Date(m.deadline),
            urgency: m.urgency,
            status: m.status,
            createdAt: new Date(m.createdAt),
            xpAwarded: m.xpAwarded,
            color: '#3b82f6',
            recurrence: m.recurrence || null, // Ensure recurrence is null if not set
            subtasks: m.subtasks || [] // Ensure subtasks is an empty array if not set
          }));
          setTasks(parsedMissions);
          console.log(`✅ Loaded ${parsedMissions.length} missions from Cloud.`);
        }
      });
    }
  }, [user, setTasks]);

  return null;
}

// Root app — wraps ClerkProvider
export default function App() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.onerror = (msg, _url, line, col, err) => {
      setError(`Global Error: ${msg} at ${line}:${col}`);
      console.error(err);
    };
    window.onunhandledrejection = (event) => {
      setError(`Unhandled Rejection: ${event.reason}`);
    };
  }, []);

  if (error) {
    return (
      <div style={{ background: 'red', color: 'white', padding: '20px', zIndex: 99999, position: 'fixed', inset: 0, overflow: 'auto' }}>
        <h1>Crash Detected</h1>
        <pre>{error}</pre>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  try {
    return (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={{
        variables: {
          colorPrimary: '#3b82f6',
          colorText: 'white',
          colorTextSecondary: 'white',
          colorBackground: '#1f2937',
          colorInputBackground: '#374151',
          colorInputText: 'white',
          colorTextOnPrimaryBackground: 'white',
        },
        elements: {
          providerIcon__github: { filter: 'invert(1)' },
          socialButtonsIconButton: { color: 'white' },
          socialButtonsBlockButton: { color: 'white', borderColor: 'rgba(255,255,255,0.2)' },
          socialButtonsBlockButtonText: { color: 'white' },
          formButtonPrimary: { color: 'white' },
          footerActionLink: { color: '#60a5fa' },
          userButtonPopoverCard: { color: 'white' },
          userButtonPopoverActionButton: { color: 'white' },
          userButtonPopoverActionButtonText: { color: 'white' },
          userButtonPopoverFooter: { display: 'none' }
        }
      }}>
        <AppContent />
      </ClerkProvider>
    );
  } catch (e: any) {
    return <div style={{ color: 'red' }}>Render Error: {e.message}</div>;
  }
}

// Nationality modal — shown once on first sign-in
function NationalityModal({ onSave }: { onSave: (code: string) => void }) {
  const [selected, setSelected] = useState('IN');
  const [saving, setSaving] = useState(false);
  const { user } = useUser();

  const handleSave = async (code: string) => {
    setSaving(true);
    try {
      await user?.update({ unsafeMetadata: { nationality: code } });
    } catch (e) { console.error(e); }
    setSaving(false);
    onSave(code);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        background: 'rgba(5,5,20,0.99)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '20px', padding: '32px',
        width: '90%', maxWidth: '420px',
        boxShadow: '0 0 60px rgba(59,130,246,0.15)',
        color: 'white',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🌍</div>
          <h2 style={{
            margin: '0 0 8px',
            fontSize: '20px', fontWeight: 800,
            background: 'linear-gradient(90deg, #60a5fa, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Mission Profile Setup</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', lineHeight: 1.5 }}>
            Select your home country to set your default timezone for the world clock.
          </p>
        </div>

        {/* Country grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '8px', maxHeight: '280px', overflowY: 'auto',
          marginBottom: '20px',
          paddingRight: '4px',
        }}>
          {COUNTRIES.map(c => (
            <div
              key={c.code}
              onClick={() => setSelected(c.code)}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                border: selected === c.code
                  ? '1px solid rgba(59,130,246,0.6)'
                  : '1px solid rgba(255,255,255,0.06)',
                background: selected === c.code
                  ? 'rgba(59,130,246,0.15)'
                  : 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.15s',
                fontSize: '12px',
                color: selected === c.code ? '#60a5fa' : '#9ca3af',
              }}
            >
              <img
                src={flagUrl(c.iso2, '24x18')}
                alt={c.name}
                style={{ width: '20px', height: '15px', borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }}
              />
              <span style={{ fontWeight: selected === c.code ? 700 : 400 }}>{c.name}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleSave('IN')}
            disabled={saving}
            style={{
              flex: 1, padding: '11px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', color: '#6b7280',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Skip (India)
          </button>
          <button
            onClick={() => handleSave(selected)}
            disabled={saving}
            style={{
              flex: 2, padding: '11px',
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
              border: 'none', borderRadius: '12px',
              color: 'white', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(59,130,246,0.3)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {saving ? 'Saving...' : 'Confirm Location 🌍'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Auth gate — shows landing page or main app
function AppContent() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [nationalitySet, setNationalitySet] = useState(false);

  // Once user loads, check if nationality is already set
  useEffect(() => {
    if (user?.unsafeMetadata?.nationality) setNationalitySet(true);
  }, [user]);

  if (!isLoaded) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#60a5fa', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7 }}>
          Initializing...
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <LandingPage />;

  // Show nationality modal on first sign-in
  if (!nationalitySet) {
    return <NationalityModal onSave={() => setNationalitySet(true)} />;
  }

  return <MainApp />;
}

// Main app — shown only when signed in
function MainApp() {
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const level = useTaskStore((state) => state.level);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bgIndex, setBgIndex] = useState(0);
  const bg = BACKGROUNDS[bgIndex];
  const cycleBg = () => setBgIndex(i => (i + 1) % BACKGROUNDS.length);

  // Floating quick-add state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [qaTitle, setQaTitle] = useState('');
  const [qaDate, setQaDate] = useState(new Date().toISOString().split('T')[0]);
  const [qaTime, setQaTime] = useState('12:00');
  const [qaDesc, setQaDesc] = useState('');
  const [qaCategory, setQaCategory] = useState<TaskCategory>('work');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [qaColor, setQaColor] = useState('#ff4444');
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  // New UI Overlays
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [focusTask, setFocusTask] = useState<any | null>(null);

  // Black hole effect state
  const [shrinkingTasks, setShrinkingTasks] = useState<string[]>([]);

  const { user: clerkUser } = useUser();

  // Derive timezone from user's saved nationality
  const nationalityCode = (clerkUser?.unsafeMetadata?.nationality as string) ?? 'IN';
  const userTimezone = getCountryByCode(nationalityCode).tz;

  const handleQuickAdd = () => {
    if (!qaTitle.trim()) return;
    const deadline = new Date(`${qaDate}T${qaTime}`);
    const newTask = {
      title: qaTitle,
      deadline,
      urgency: 1,
      color: qaColor,
      description: qaDesc,
      category: qaCategory,
      recurrence: null, // Default to no recurrence for quick add
      subtasks: [] // Default to no subtasks for quick add
    };
    addTask(newTask);
    if (clerkUser) MongoService.syncTask({ ...newTask, status: 'active', id: 'pending-sync' }, clerkUser);

    // Schedule notification
    NotificationService.requestPermission().then(granted => {
      if (granted) NotificationService.scheduleForTask(Math.random().toString(), qaTitle, deadline);
    });

    setQaTitle(''); setQaDate(new Date().toISOString().split('T')[0]);
    setQaTime('12:00'); setQaColor('#00cc88'); setQaDesc('');
    setShowQuickAdd(false);
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onNewMission: () => setShowQuickAdd(true),
    onDashboard: () => setShowDashboard(true),
    onAchievements: () => setShowAchievements(true),
    onLeaderboard: () => setShowLeaderboard(true),
    onClose: () => {
      setShowDashboard(false);
      setShowAchievements(false);
      setShowLeaderboard(false);
      setShowQuickAdd(false);
      setFocusTask(null);
    }
  });

  // Sync notifications on load
  useEffect(() => {
    NotificationService.requestPermission().then(granted => {
      if (granted) NotificationService.scheduleAll(tasks);
    });
  }, [tasks]);


  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState<'orbit' | 'schedule' | 'logs'>('orbit');

  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(320);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const activeTasks = tasks.filter(task =>
    isSameDay(new Date(task.deadline), selectedDate) || task.status === 'completed'
  );

  const handleEditTask = (id: string) => setEditingTaskId(id);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) setLeftWidth(Math.max(200, Math.min(600, e.clientX)));
      if (isResizingRight) setRightWidth(Math.max(250, Math.min(600, window.innerWidth - e.clientX)));
    };
    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
      document.body.style.cursor = 'auto';
    };
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: bg.color, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'background 0.8s' }}>

      <Header
        onChangeBg={cycleBg}
        currentBgLabel={bg.label}
        onToggleDashboard={() => setShowDashboard(v => !v)}
        onToggleAchievements={() => setShowAchievements(v => !v)}
        onToggleLeaderboard={() => setShowLeaderboard(v => !v)}
      />
      <DataSync />

      <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', position: 'relative', height: 'calc(100vh - 60px)', minHeight: '600px', overflow: 'hidden' }}>

        {/* LEFT: Calendar (desktop) */}
        {!isMobile && (
          <div style={{ width: leftWidth, position: 'relative', flexShrink: 0, zIndex: 20 }}>
            <CalendarWindow selectedDate={selectedDate} onDateChange={setSelectedDate} />
            <div
              onMouseDown={() => setIsResizingLeft(true)}
              style={{ position: 'absolute', right: 0, top: 0, width: '6px', height: '100%', cursor: 'col-resize', zIndex: 100, borderRight: '1px solid rgba(255,255,255,0.1)' }}
              className="hover:bg-blue-500/50 transition-colors"
            />
          </div>
        )}

        {/* MOBILE: Calendar tab */}
        {isMobile && activeTab === 'schedule' && (
          <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '70px' }}>
            <CalendarWindow selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
        )}

        {/* CENTER: 3D Canvas */}
        <div style={{
          flex: 1, position: 'relative', minWidth: 0, zIndex: 10,
          background: bg.color,
          display: (isMobile && activeTab !== 'orbit') ? 'none' : 'block',
          paddingBottom: isMobile ? '70px' : 0
        }}>
          {/* Top-center title */}
          <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'white', pointerEvents: 'none', zIndex: 10, textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', textShadow: '0 0 10px rgba(255,255,255,0.5)', letterSpacing: '4px', fontWeight: 'bold' }}>ZERO-G</h1>
            <p style={{ margin: 0, opacity: 0.7, letterSpacing: '1px', fontSize: isMobile ? '0.7rem' : '0.8rem' }}>DAILY MISSION CONTROL 🚀</p>
          </div>

          {/* Floating Quick-Add — top right of canvas */}
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 50, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Toggle button */}
            <button
              onClick={() => setShowQuickAdd(v => !v)}
              style={{
                background: showQuickAdd ? 'rgba(59,130,246,0.15)' : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                border: showQuickAdd ? '1px solid rgba(59,130,246,0.4)' : 'none',
                borderRadius: '24px', color: 'white',
                padding: '8px 18px', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.5px',
                boxShadow: showQuickAdd ? 'none' : '0 0 20px rgba(59,130,246,0.4)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '7px',
              }}
            >
              {showQuickAdd ? '✕ Close' : '+ New Mission Protocol'}
            </button>

            {/* Dropdown panel */}
            {showQuickAdd && (
              <div style={{
                marginTop: '10px',
                background: 'rgba(5,5,20,0.97)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '16px', padding: '18px',
                width: '280px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(59,130,246,0.1)',
                backdropFilter: 'blur(12px)',
              }}>
                <div style={{ fontSize: '10px', color: '#60a5fa', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                  Quick Mission Protocol
                </div>

                {/* Title */}
                <input
                  type="text" placeholder="Mission title..."
                  value={qaTitle} onChange={e => setQaTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box', marginBottom: '8px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '8px 12px', color: 'white',
                    fontSize: '13px', outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                />

                {/* Date + Time row */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="date" value={qaDate} onChange={e => setQaDate(e.target.value)}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', padding: '7px 8px', color: 'white',
                      fontSize: '12px', outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  />
                  <input
                    type="time" value={qaTime} onChange={e => setQaTime(e.target.value)}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', padding: '7px 8px', color: 'white',
                      fontSize: '12px', outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  />
                </div>

                {/* Category Selection */}
                <div style={{ marginBottom: '12px', position: 'relative' }}>
                  <label style={{ fontSize: '10px', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>
                    Category
                  </label>
                  <div
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    style={{
                      width: '100%', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '10px', padding: '10px 12px', color: 'white',
                      fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s', backdropFilter: 'blur(10px)',
                    }}
                  >
                    <span>
                      {qaCategory === 'work' && '💼 Work'}
                      {qaCategory === 'personal' && '🏠 Personal'}
                      {qaCategory === 'health' && '🏥 Health'}
                      {qaCategory === 'learning' && '📚 Learning'}
                      {qaCategory === 'other' && '✨ Other'}
                    </span>
                    <span style={{ transform: showCategoryMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                  </div>

                  {showCategoryMenu && (
                    <div style={{
                      position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: '8px',
                      background: 'rgba(10, 10, 30, 0.95)', border: '1px solid rgba(59, 130, 246, 0.5)',
                      borderRadius: '12px', overflow: 'hidden', zIndex: 100, backdropFilter: 'blur(20px)',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
                    }}>
                      {(['work', 'personal', 'health', 'learning', 'other'] as TaskCategory[]).map(cat => (
                        <div
                          key={cat}
                          onClick={() => {
                            setQaCategory(cat);
                            setShowCategoryMenu(false);
                          }}
                          style={{
                            padding: '10px 12px', color: 'white', fontSize: '13px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: qaCategory === cat ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'}
                          onMouseLeave={e => e.currentTarget.style.background = qaCategory === cat ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                        >
                          {cat === 'work' && '💼 Work'}
                          {cat === 'personal' && '🏠 Personal'}
                          {cat === 'health' && '🏥 Health'}
                          {cat === 'learning' && '📚 Learning'}
                          {cat === 'other' && '✨ Other'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Color swatches */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {['#ff4444', '#ffaa00', '#00cc88'].map(c => (
                    <div
                      key={c} onClick={() => setQaColor(c)}
                      style={{
                        flex: 1, height: '28px', background: c, borderRadius: '8px',
                        cursor: 'pointer', transition: 'all 0.2s',
                        border: qaColor === c ? '2px solid white' : '2px solid transparent',
                        opacity: qaColor === c ? 1 : 0.4,
                        boxShadow: qaColor === c ? `0 0 10px ${c} ` : 'none',
                      }}
                    />
                  ))}
                </div>

                {/* Description */}
                <textarea
                  placeholder="Mission details (optional)..."
                  value={qaDesc} onChange={e => setQaDesc(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%', boxSizing: 'border-box', marginBottom: '12px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '8px 12px', color: 'white',
                    fontSize: '12px', outline: 'none', resize: 'none',
                    fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.5,
                  }}
                />

                {/* Submit */}
                <button
                  onClick={handleQuickAdd}
                  style={{
                    width: '100%', padding: '10px',
                    background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                    border: 'none', borderRadius: '10px', color: 'white',
                    fontWeight: 700, fontSize: '12px', textTransform: 'uppercase',
                    letterSpacing: '0.8px', cursor: 'pointer',
                    boxShadow: '0 0 16px rgba(59,130,246,0.3)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  Initialize Mission
                </button>
              </div>
            )}
          </div>


          <Canvas camera={{ position: [0, 15, 20], fov: 60 }} style={{ width: '100%', height: '100%' }}>
            <color attach="background" args={[bg.color as any]} />
            <fog attach="fog" args={[bg.fog, 5, 50]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <pointLight position={[-10, -10, -5]} intensity={1} />
            <Suspense fallback={null}>
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} speed={1} />
            </Suspense>
            <OrbitControls enablePan={true} maxDistance={40} minDistance={2} maxPolarAngle={Math.PI / 1.5} />

            {/* Background Click to dismiss bubble info */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -5, 0]}
              onPointerDown={(e) => { e.stopPropagation(); setActiveBubbleId(null); }}
              visible={false}
            >
              <planeGeometry args={[1000, 1000]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>

            <TimeRing timezone={userTimezone} />

            {/* Category Rings — evolve with level */}
            <CategoryRing
              radius={4}
              color={level >= 4 ? '#a855f7' : level === 3 ? '#f59e0b' : level === 2 ? '#06b6d4' : '#3b82f6'}
              opacity={level >= 2 ? 0.15 : 0.08}
            /> {/* Inner */}
            <CategoryRing
              radius={6}
              color={level >= 4 ? '#a855f7' : level === 3 ? '#f59e0b' : level === 2 ? '#06b6d4' : '#10b981'}
              opacity={level >= 2 ? 0.15 : 0.08}
            /> {/* Middle */}
            <CategoryRing
              radius={8}
              color={level >= 4 ? '#a855f7' : level === 3 ? '#f59e0b' : level === 2 ? '#06b6d4' : '#f59e0b'}
              opacity={level >= 2 ? 0.15 : 0.08}
            /> {/* Outer */}

            {/* Asteroid Belt for overdue */}
            <AsteroidBelt />

            {/* Constellations */}
            <ConstellationLines
              tasks={activeTasks}
              getTaskPosition={(t) => {
                const hours = (new Date(t.deadline).getHours() + new Date(t.deadline).getMinutes() / 60);
                const theta = (hours / 24) * Math.PI * 2;
                const radius = t.urgency === 5 ? 3 : t.urgency === 1 ? 9 : 6;
                return [Math.sin(theta) * radius, 0, Math.cos(theta) * radius];
              }}
            />

            {activeTasks.filter(t => !shrinkingTasks.includes(t.id)).map((task) => (
              <TaskBubble
                key={task.id}
                task={task}
                onEdit={() => handleEditTask(task.id)}
                onFocus={() => setFocusTask(task)}
                activeBubbleId={activeBubbleId}
                setActiveBubbleId={setActiveBubbleId}
              />
            ))}

            {/* Black hole animations */}
            {shrinkingTasks.map(id => {
              const task = tasks.find(t => t.id === id);
              if (!task) return null;
              const hours = (new Date(task.deadline).getHours() + new Date(task.deadline).getMinutes() / 60);
              const theta = (hours / 24) * Math.PI * 2;
              const radius = task.urgency === 5 ? 3 : task.urgency === 1 ? 9 : 6;
              return (
                <BlackHole
                  key={id}
                  position={[Math.sin(theta) * radius, 0, Math.cos(theta) * radius]}
                  onDone={() => setShrinkingTasks(old => old.filter(oid => oid !== id))}
                />
              );
            })}

            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} toneMapped={false} />
              <pointLight distance={10} intensity={2} color="white" />
            </mesh>
          </Canvas>
        </div>

        {/* RIGHT: Mission Log (desktop) */}
        {!isMobile && (
          <div style={{ width: rightWidth, position: 'relative', flexShrink: 0, zIndex: 20 }}>
            <div
              onMouseDown={() => setIsResizingRight(true)}
              style={{ position: 'absolute', left: 0, top: 0, width: '6px', height: '100%', cursor: 'col-resize', zIndex: 100, borderLeft: '1px solid rgba(255,255,255,0.1)' }}
              className="hover:bg-blue-500/50 transition-colors"
            />
            <MissionLog selectedDate={selectedDate} onEditTask={handleEditTask} editingTaskId={editingTaskId} />
          </div>
        )}

        {/* MOBILE: Logs tab */}
        {isMobile && activeTab === 'logs' && (
          <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '70px' }}>
            <MissionLog selectedDate={selectedDate} onEditTask={handleEditTask} editingTaskId={editingTaskId} />
          </div>
        )}

        {/* MOBILE: Nav bar */}
        {isMobile && (
          <div style={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 1000, background: '#050510' }}>
            <MobileNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        )}
      </div>

      {/* Overlays */}
      <AchievementToast />
      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
      {showAchievements && <AchievementsPanel onClose={() => setShowAchievements(false)} />}
      {showLeaderboard && (
        <LeaderboardPanel
          onClose={() => setShowLeaderboard(false)}
          currentXp={useTaskStore.getState().xp}
          currentLevel={useTaskStore.getState().level}
        />
      )}
      {focusTask && (
        <PomodoroTimer
          task={focusTask}
          onClose={() => setFocusTask(null)}
          onComplete={() => {
            useTaskStore.getState().completeTask(focusTask.id);
            if (clerkUser) {
              const taskRef = useTaskStore.getState().tasks.find(t => t.id === focusTask.id);
              if (taskRef) MongoService.syncTask(taskRef, clerkUser);
            }
            setFocusTask(null);
          }}
        />
      )}
    </div>
  );
}
