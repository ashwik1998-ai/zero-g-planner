import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { useTaskStore } from './store/useTaskStore';
import { TaskBubble } from './components/TaskBubble';
import { TimeRing } from './components/TimeRing';
import { SpaceDebris } from './components/SpaceDebris';
import { Header } from './components/Header';


import { CalendarWindow } from './components/CalendarWindow';
import { MissionLog } from './components/MissionLog';
import { isSameDay } from 'date-fns';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import { useMobile } from './hooks/useMobile';
import { MobileNavBar } from './components/MobileNavBar';
import { MongoService } from './services/MongoService';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function DataSync() {
  const { user } = useUser();
  const setTasks = useTaskStore((state) => state.setTasks);

  useEffect(() => {
    if (user) {
      console.log('🔄 Fetching user missions...');
      MongoService.fetchMissions(user).then((missions: any[]) => {
        if (missions && missions.length > 0) {
          const parsedMissions = missions.map((m: any) => ({
            id: m.taskId, // Map DB 'taskId' back to store 'id'
            title: m.title,
            deadline: new Date(m.deadline),
            urgency: m.urgency,
            status: m.status,
            createdAt: new Date(m.createdAt),
            xpAwarded: m.xpAwarded,
            color: '#3b82f6' // Default color if not saved
          }));
          setTasks(parsedMissions);
          console.log(`✅ Loaded ${parsedMissions.length} missions from Cloud.`);
        }
      });
    }
  }, [user, setTasks]);

  return null;
}

export default function App() {
  const tasks = useTaskStore((state) => state.tasks);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // -- Mobile State --
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState<'orbit' | 'schedule' | 'logs'>('orbit');

  // -- Resizing State --
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(320);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  /* Filter tasks by selected date */
  const activeTasks = tasks.filter(task => {
    // Show tasks for selected date OR completed tasks (for animation)
    return isSameDay(new Date(task.deadline), selectedDate) || task.status === 'completed';
  });

  const handleEditTask = (id: string) => {
    setEditingTaskId(id);
  };

  // -- Resizing Logic --
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = Math.max(200, Math.min(600, e.clientX));
        setLeftWidth(newWidth);
      }
      if (isResizingRight) {
        const newWidth = Math.max(250, Math.min(600, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
      }
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
        socialButtonsIconButton: {
          color: 'white'
        },
        socialButtonsBlockButton: {
          color: 'white',
          borderColor: 'rgba(255,255,255,0.2)'
        },
        socialButtonsBlockButtonText: {
          color: 'white'
        },
        formButtonPrimary: {
          color: 'white'
        },
        footerActionLink: {
          color: '#60a5fa'
        },
        userButtonPopoverCard: {
          color: 'white'
        },
        userButtonPopoverActionButton: {
          color: 'white'
        },
        userButtonPopoverActionButtonText: {
          color: 'white'
        },
        userButtonPopoverFooter: {
          display: 'none'
        }
      }
    }}>
      <div style={{ width: '100vw', height: '100vh', background: '#050510', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <Header />
        <DataSync />

        {/* MAIN CONTENT AREA */}

        {/* MAIN CONTENT AREA */}
        {/* 1. LEFT SECTION (Resizable) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', position: 'relative', height: 'calc(100vh - 60px)', minHeight: '600px', overflow: 'hidden' }}>

          {!isMobile && (
            <div style={{ width: leftWidth, position: 'relative', flexShrink: 0, zIndex: 20 }}>
              <CalendarWindow
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
              <div
                onMouseDown={() => setIsResizingLeft(true)}
                style={{
                  position: 'absolute', right: 0, top: 0, width: '6px', height: '100%',
                  cursor: 'col-resize', zIndex: 100,
                  borderRight: '1px solid rgba(255,255,255,0.1)'
                }}
                className="hover:bg-blue-500/50 transition-colors"
              />
            </div>
          )}

          {/* MOBILE: Only show Calendar if activeTab is schedule */}
          {isMobile && activeTab === 'schedule' && (
            <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '70px' }}>
              <CalendarWindow
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>
          )}

          {/* 2. CENTER SECTION (Flex Grow - Always Rendered but hidden on mobile if not active) */}
          <div style={{
            flex: 1,
            position: 'relative',
            minWidth: 0,
            zIndex: 10,
            background: '#050510',
            display: (isMobile && activeTab !== 'orbit') ? 'none' : 'block',
            paddingBottom: isMobile ? '70px' : 0
          }}>

            {/* HUD */}
            <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'white', pointerEvents: 'none', zIndex: 10, textAlign: 'center' }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', textShadow: '0 0 10px rgba(255,255,255,0.5)', letterSpacing: '4px', fontWeight: 'bold' }}>ZERO-G</h1>
              <p style={{ margin: 0, opacity: 0.7, letterSpacing: '1px', fontSize: isMobile ? '0.7rem' : '0.8rem' }}>DAILY MISSION CONTROL 🚀</p>
            </div>

            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 15, 20], fov: 60 }} style={{ width: '100%', height: '100%' }}>
              <color attach="background" args={['#050510']} />
              <fog attach="fog" args={['#050510', 5, 50]} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={2} />
              <pointLight position={[-10, -10, -5]} intensity={1} />

              <Suspense fallback={null}>
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} speed={1} />
                <SpaceDebris />
              </Suspense>

              <OrbitControls enablePan={true} maxDistance={40} minDistance={2} maxPolarAngle={Math.PI / 1.5} />

              <TimeRing />

              {activeTasks.map((task) => (
                <TaskBubble
                  key={task.id}
                  task={task}
                  onEdit={() => handleEditTask(task.id)}
                />
              ))}

              {/* Sun */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#ffffff"
                  emissiveIntensity={2}
                  toneMapped={false}
                />
                <pointLight distance={10} intensity={2} color="white" />
              </mesh>

            </Canvas>
          </div>


          {/* 3. RIGHT SECTION (Resizable) */}
          {!isMobile && (
            <div style={{ width: rightWidth, position: 'relative', flexShrink: 0, zIndex: 20 }}>
              <div
                onMouseDown={() => setIsResizingRight(true)}
                style={{
                  position: 'absolute', left: 0, top: 0, width: '6px', height: '100%',
                  cursor: 'col-resize', zIndex: 100,
                  borderLeft: '1px solid rgba(255,255,255,0.1)'
                }}
                className="hover:bg-blue-500/50 transition-colors"
              />
              <MissionLog
                selectedDate={selectedDate}
                onEditTask={handleEditTask}
                editingTaskId={editingTaskId}
              />
            </div>
          )}

          {/* MOBILE: Only show Logs if activeTab is logs */}
          {isMobile && activeTab === 'logs' && (
            <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '70px' }}>
              <MissionLog
                selectedDate={selectedDate}
                onEditTask={handleEditTask}
                editingTaskId={editingTaskId}
              />
            </div>
          )}

          {/* MOBILE NAV BAR */}
          {isMobile && (
            <div style={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 1000, background: '#050510' }}>
              <MobileNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          )}

        </div>
      </div>
    </ClerkProvider>
  );
}
