import { useEffect, useRef, useState, useCallback } from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { SoundService } from '../services/SoundService';

// ─── Data ────────────────────────────────────────────────────────────────────
const FEATURES = [
    { icon: '🤖', title: 'ARIA AI Co-Pilot', desc: 'Ask your personal AI mission assistant anything. "What\'s overdue?" or "How productive was I this week?" — ARIA reads your real data.' },
    { icon: '🪐', title: 'Orbital Mission View', desc: 'Visualize tasks as planets orbiting a star. Urgency = proximity. Your day, mapped to the cosmos.' },
    { icon: '🚀', title: 'Launch & Track', desc: 'Complete missions by launching them into orbit. Earn XP, level up, and watch productivity soar.' },
    { icon: '📅', title: 'Mission Calendar', desc: 'Plan missions by date. Switch days instantly — no clutter, just your daily objectives.' },
    { icon: '☁️', title: 'Cloud Sync', desc: 'Your missions follow you everywhere. Sign in on any device, data restored instantly.' },
    { icon: '🎮', title: 'Gamified XP System', desc: 'Every completed mission earns XP. Level up your commander rank and make productivity a game.' },
    { icon: '🎨', title: 'Dynamic Themes', desc: 'Switch between 5 space themes — Deep Space, Nebula, Cosmic Purple, Aurora, Red Dwarf.' },
];

const HOW_IT_WORKS = [
    { step: '01', icon: '📅', title: 'Plan Your Mission', desc: 'Add tasks with deadlines, categories, and urgency levels through the mission calendar.' },
    { step: '02', icon: '🪐', title: 'Watch It Orbit', desc: 'Your tasks appear as planets orbiting a star in 3D space — closer = more urgent.' },
    { step: '03', icon: '🚀', title: 'Launch & Earn', desc: 'Complete missions to launch them. Earn XP, level up your rank, and hit the leaderboard.' },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true); },
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);
    return { ref, inView };
}

function useMousePosition() {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);
    return pos;
}

function useTypewriter(text: string, speed = 60, startDelay = 400) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    useEffect(() => {
        let i = 0;
        const delay = setTimeout(() => {
            const id = setInterval(() => {
                setDisplayed(text.slice(0, i + 1));
                i++;
                if (i >= text.length) { clearInterval(id); setDone(true); }
            }, speed);
            return () => clearInterval(id);
        }, startDelay);
        return () => clearTimeout(delay);
    }, [text, speed, startDelay]);
    return { displayed, done };
}

// ─── Cursor Trail ─────────────────────────────────────────────────────────────
function CursorTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<{ x: number; y: number; alpha: number; r: number; vx: number; vy: number }[]>([]);
    const animId = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize);

        const onMove = (e: MouseEvent) => {
            for (let i = 0; i < 3; i++) {
                particles.current.push({
                    x: e.clientX + (Math.random() - 0.5) * 10,
                    y: e.clientY + (Math.random() - 0.5) * 10,
                    alpha: 0.8,
                    r: Math.random() * 2.5 + 0.5,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5 - 0.5,
                });
            }
        };
        window.addEventListener('mousemove', onMove);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.current = particles.current.filter(p => p.alpha > 0.02);
            particles.current.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.alpha *= 0.92;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                const color = Math.random() > 0.5 ? `rgba(96,165,250,${p.alpha})` : `rgba(6,182,212,${p.alpha})`;
                ctx.fillStyle = color;
                ctx.fill();
            });
            animId.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId.current);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 5, pointerEvents: 'none' }} />;
}

// ─── Starfield ────────────────────────────────────────────────────────────────
function StarField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const stars = Array.from({ length: 320 }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            r: Math.random() * 1.8 + 0.3, alpha: Math.random(), speed: Math.random() * 0.005 + 0.002,
        }));
        let id: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(s => {
                s.alpha += s.speed;
                if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
            });
            id = requestAnimationFrame(draw);
        };
        draw();
        const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(id); window.removeEventListener('resize', onResize); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

// ─── Shooting Stars ───────────────────────────────────────────────────────────
function ShootingStars() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;

        type Meteor = { x: number; y: number; len: number; speed: number; alpha: number; active: boolean };
        const meteors: Meteor[] = Array.from({ length: 5 }, () => ({ x: 0, y: 0, len: 0, speed: 0, alpha: 0, active: false }));

        const spawn = (m: Meteor) => {
            m.x = Math.random() * canvas.width * 0.8;
            m.y = Math.random() * canvas.height * 0.3;
            m.len = Math.random() * 120 + 60;
            m.speed = Math.random() * 8 + 6;
            m.alpha = 1;
            m.active = true;
        };

        // Stagger spawns
        meteors.forEach((m, i) => setTimeout(() => spawn(m), i * 2500 + Math.random() * 4000));

        let id: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            meteors.forEach(m => {
                if (!m.active) return;
                m.x += m.speed; m.y += m.speed * 0.5; m.alpha -= 0.018;
                if (m.alpha <= 0) { setTimeout(() => spawn(m), Math.random() * 6000 + 3000); m.active = false; return; }
                ctx.beginPath();
                const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.len, m.y - m.len * 0.5);
                grad.addColorStop(0, `rgba(255,255,255,${m.alpha})`);
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.strokeStyle = grad; ctx.lineWidth = 1.5;
                ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.len, m.y - m.len * 0.5);
                ctx.stroke();
            });
            id = requestAnimationFrame(draw);
        };
        draw();
        const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(id); window.removeEventListener('resize', onResize); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
}

// ─── Parallax Orbit Demo ──────────────────────────────────────────────────────
function OrbitDemo({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
    const [angle, setAngle] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setAngle(a => a + 0.4), 16);
        return () => clearInterval(id);
    }, []);

    const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
    const px = ((mouseX - cx) / cx) * 12;
    const py = ((mouseY - cy) / cy) * 8;

    const planets = [
        { dist: 58, size: 11, color: '#ff4444', speed: 1.0, label: 'Urgent' },
        { dist: 88, size: 9, color: '#ffaa00', speed: 0.6, label: 'Normal' },
        { dist: 118, size: 8, color: '#00cc88', speed: 0.38, label: 'Casual' },
    ];

    return (
        <div style={{ position: 'relative', width: '280px', height: '280px', flexShrink: 0 }}>
            {/* Orbit rings */}
            {planets.map((p, i) => (
                <div key={i} style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: p.dist * 2, height: p.dist * 2,
                    marginLeft: -p.dist, marginTop: -p.dist,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transform: `translate(${px * 0.3}px, ${py * 0.3}px)`,
                    transition: 'transform 0.1s ease',
                }} />
            ))}
            {/* Sun */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 28, height: 28, marginLeft: -14, marginTop: -14,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fff 0%, #fffde7 40%, #ffd54f 100%)',
                boxShadow: '0 0 24px #fff, 0 0 50px #ffd54f, 0 0 80px rgba(255,213,79,0.4)',
                animation: 'sun-pulse 2s ease-in-out infinite',
                transform: `translate(${px}px, ${py}px)`,
                transition: 'transform 0.08s ease',
            }} />
            {/* Planets */}
            {planets.map((p, i) => {
                const a = (angle * p.speed + i * 120) * (Math.PI / 180);
                const x = 140 + Math.cos(a) * p.dist - p.size / 2 + px * (0.5 + i * 0.2);
                const y = 140 + Math.sin(a) * p.dist - p.size / 2 + py * (0.5 + i * 0.2);
                return (
                    <div key={i} style={{
                        position: 'absolute', left: x, top: y,
                        width: p.size, height: p.size, borderRadius: '50%',
                        background: p.color,
                        boxShadow: `0 0 14px ${p.color}, 0 0 28px ${p.color}55`,
                        transition: 'left 0.04s linear, top 0.04s linear',
                    }} />
                );
            })}
        </div>
    );
}

// ─── 3D Tilt Feature Card ─────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
    const { ref, inView } = useInView(0.1);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -10;
        const rotY = ((x - cx) / cx) * 10;
        card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
        card.style.boxShadow = `0 20px 60px rgba(59,130,246,0.2), 0 0 0 1px rgba(59,130,246,0.2)`;
    }, []);

    const handleMouseLeave = useCallback(() => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
        card.style.boxShadow = 'none';
    }, []);

    return (
        <div ref={ref} style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(40px)',
            transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        }}>
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    padding: '28px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.3s',
                    cursor: 'default',
                    height: '100%',
                    boxSizing: 'border-box',
                }}
            >
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{icon}</div>
                <h3 style={{ margin: '0 0 10px', fontSize: '17px', fontWeight: 700, color: 'white' }}>{title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: 1.7 }}>{desc}</p>
            </div>
        </div>
    );
}

// ─── Animated Section ─────────────────────────────────────────────────────────
function AnimatedSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    const { ref, inView } = useInView();
    return (
        <div ref={ref} style={{
            ...style,
            transition: 'opacity 0.7s ease, transform 0.7s ease',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(32px)',
        }}>
            {children}
        </div>
    );
}

// ─── How It Works Step ────────────────────────────────────────────────────────
function HowStep({ step, icon, title, desc, delay, isLast }: { step: string; icon: string; title: string; desc: string; delay: number; isLast: boolean }) {
    const { ref, inView } = useInView(0.2);
    return (
        <div ref={ref} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            flex: 1, position: 'relative',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(30px)',
            transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        }}>
            {/* Connector line */}
            {!isLast && (
                <div style={{
                    position: 'absolute', top: '42px', left: 'calc(50% + 52px)',
                    right: 'calc(-50% + 52px)', height: '1px',
                    background: 'linear-gradient(90deg, rgba(59,130,246,0.4), rgba(59,130,246,0))',
                }} />
            )}
            {/* Icon circle */}
            <div style={{
                width: '84px', height: '84px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.15))',
                border: '1px solid rgba(59,130,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', marginBottom: '20px',
                boxShadow: '0 0 30px rgba(59,130,246,0.1)',
                position: 'relative', zIndex: 1,
            }}>
                {icon}
                {/* Step number badge */}
                <div style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 800, color: 'white',
                }}>
                    {step}
                </div>
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 700, color: 'white' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: 1.7, maxWidth: '220px' }}>{desc}</p>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [heroVisible, setHeroVisible] = useState(false);
    const mouse = useMousePosition();
    const { displayed: typedTitle, done: titleDone } = useTypewriter('Plan Your Day', 80, 300);
    const { displayed: typedSub } = useTypewriter('Like a Commander', 80, titleDone ? 100 : 99999);

    // Override body scroll lock (index.css sets overflow:hidden for the 3D canvas)
    useEffect(() => {
        const prev = { overflow: document.body.style.overflow, height: document.body.style.height };
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.documentElement.style.height = 'auto';
        return () => {
            document.body.style.overflow = prev.overflow;
            document.body.style.height = prev.height;
            document.documentElement.style.overflow = '';
            document.documentElement.style.height = '';
        };
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setHeroVisible(true), 100);
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#050510', color: 'white', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden', scrollBehavior: 'smooth' }}>
            <style>{`
                @keyframes sun-pulse {
                    0%, 100% { box-shadow: 0 0 24px #fff, 0 0 50px #ffd54f, 0 0 80px rgba(255,213,79,0.4); }
                    50% { box-shadow: 0 0 40px #fff, 0 0 80px #ffd54f, 0 0 120px rgba(255,213,79,0.6); }
                }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
                @keyframes badge-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; }
                }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                html { scroll-behavior: smooth; }
            `}</style>

            <StarField />
            <ShootingStars />
            <CursorTrail />

            {/* NAV */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 40px', height: '64px',
                background: scrolled ? 'rgba(5,5,16,0.95)' : 'transparent',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                transition: 'all 0.3s',
            }}>
                <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #60a5fa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Zero-G Planner
                </span>
                <SignInButton mode="modal">
                    <button
                        onMouseEnter={() => SoundService.playHover()}
                        onClick={() => SoundService.playClick()}
                        style={{
                            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                            border: 'none', cursor: 'pointer', color: 'white',
                            padding: '9px 22px', borderRadius: '24px',
                            fontWeight: 700, fontSize: '14px',
                            boxShadow: '0 0 20px rgba(59,130,246,0.4)',
                            transition: 'all 0.2s',
                        }}
                    >
                        Launch App →
                    </button>
                </SignInButton>
            </nav>

            {/* ── HERO ── */}
            <section style={{
                position: 'relative', zIndex: 10,
                minHeight: '100vh',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '100px 24px 60px', gap: '32px',
            }}>
                {/* Live badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 18px', borderRadius: '24px',
                    background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                    fontSize: '13px', color: '#60a5fa', fontWeight: 600,
                    animation: 'badge-pulse 2s ease-in-out infinite',
                    opacity: heroVisible ? 1 : 0, transition: 'opacity 0.8s ease',
                }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', boxShadow: '0 0 8px #60a5fa' }} />
                    Mission Control is Live
                </div>

                {/* Typewriter headline */}
                <div style={{
                    opacity: heroVisible ? 1 : 0,
                    transition: 'opacity 0.8s ease 0.1s',
                }}>
                    <h1 style={{ margin: 0, fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px' }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #06b6d4 100%)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            animation: 'gradient-shift 4s ease infinite',
                        }}>
                            {typedTitle}
                            {!titleDone && <span style={{ animation: 'blink 0.8s infinite', WebkitTextFillColor: '#60a5fa' }}>|</span>}
                        </span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            animation: 'gradient-shift 4s ease infinite 1s',
                        }}>
                            {typedSub}
                            {titleDone && <span style={{ animation: 'blink 0.8s infinite', WebkitTextFillColor: '#a78bfa' }}>|</span>}
                        </span>
                    </h1>
                    <p style={{
                        marginTop: '20px', fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                        color: '#9ca3af', maxWidth: '540px', lineHeight: 1.7,
                        marginLeft: 'auto', marginRight: 'auto',
                    }}>
                        Zero-G Planner turns your daily tasks into orbital missions. Visualize urgency in 3D space, earn XP for completing goals, and sync everything to the cloud.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div style={{
                    display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.8s ease 0.25s, transform 0.8s ease 0.25s',
                }}>
                    <SignInButton mode="modal">
                        <button
                            onMouseEnter={() => SoundService.playHover()}
                            onClick={() => SoundService.playClick()}
                            style={{
                                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                                border: 'none', cursor: 'pointer', color: 'white',
                                padding: '16px 36px', borderRadius: '32px', fontWeight: 700, fontSize: '16px',
                                boxShadow: '0 0 40px rgba(59,130,246,0.5)',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                            }}
                        >
                            🚀 Start Your Mission
                        </button>
                    </SignInButton>
                    <button
                        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                            cursor: 'pointer', color: 'white', padding: '16px 32px', borderRadius: '32px',
                            fontWeight: 600, fontSize: '16px', textDecoration: 'none',
                            transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                    >
                        How It Works ↓
                    </button>
                </div>

                {/* Parallax Orbit Demo */}
                <div style={{
                    marginTop: '10px', padding: '30px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px', backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 80px rgba(59,130,246,0.1)',
                    animation: 'float 5s ease-in-out infinite',
                    opacity: heroVisible ? 1 : 0,
                    transition: 'opacity 0.8s ease 0.4s',
                }}>
                    <OrbitDemo mouseX={mouse.x} mouseY={mouse.y} />
                    <p style={{ margin: '16px 0 0', fontSize: '12px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Move your mouse over the orbit ✦
                    </p>
                </div>
            </section>

            {/* ── STATS ── */}
            <AnimatedSection style={{ position: 'relative', zIndex: 10, padding: '0 24px 80px' }}>
                <div style={{
                    maxWidth: '800px', margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
                    background: 'rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    {[{ num: '3D', label: 'Orbital View' }, { num: '5', label: 'Space Themes' }, { num: '∞', label: 'Missions' }].map((s, i) => (
                        <div key={i} style={{ padding: '28px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #60a5fa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.num}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </AnimatedSection>

            {/* ── HOW IT WORKS ── */}
            <section id="how-it-works" style={{ position: 'relative', zIndex: 10, padding: '40px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
                <AnimatedSection style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ fontSize: '12px', color: '#60a5fa', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>
                        Mission Briefing
                    </div>
                    <h2 style={{
                        margin: 0, fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-1px',
                        background: 'linear-gradient(90deg, #fff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        How It Works
                    </h2>
                </AnimatedSection>

                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {HOW_IT_WORKS.map((s, i) => (
                        <HowStep key={i} {...s} delay={i * 150} isLast={i === HOW_IT_WORKS.length - 1} />
                    ))}
                </div>
            </section>

            {/* ── AI SHOWCASE ── */}
            <AnimatedSection style={{ position: 'relative', zIndex: 10, padding: '0 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{
                    borderRadius: '24px', overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))',
                    border: '1px solid rgba(124,58,237,0.25)',
                    boxShadow: '0 0 60px rgba(124,58,237,0.1)',
                    padding: '48px 40px',
                    display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center',
                }}>
                    {/* Left */}
                    <div style={{ flex: '1 1 280px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '5px 14px', borderRadius: '20px',
                            background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                            fontSize: '12px', color: '#a78bfa', fontWeight: 700,
                            letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px',
                        }}>
                            <span>⚡</span> Powered by Groq · Llama 3.3 70B
                        </div>
                        <h2 style={{
                            margin: '0 0 16px', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                            fontWeight: 900, letterSpacing: '-1px',
                            background: 'linear-gradient(135deg, #fff 0%, #a78bfa 60%, #06b6d4 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Meet ARIA, Your AI Mission Co-Pilot
                        </h2>
                        <p style={{ margin: '0 0 24px', color: '#9ca3af', fontSize: '15px', lineHeight: 1.7 }}>
                            ARIA reads your real mission data from the database and answers natural language questions about your productivity, deadlines, and patterns — instantly.
                        </p>
                        <SignInButton mode="modal">
                            <button style={{
                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                border: 'none', cursor: 'pointer', color: 'white',
                                padding: '12px 28px', borderRadius: '24px',
                                fontWeight: 700, fontSize: '14px',
                                boxShadow: '0 0 24px rgba(124,58,237,0.4)',
                                transition: 'all 0.2s',
                            }}>
                                🤖 Try ARIA Free →
                            </button>
                        </SignInButton>
                    </div>

                    {/* Right: chat preview */}
                    <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { from: 'user', text: 'What are my most urgent missions?' },
                            { from: 'ai', text: 'You have 3 high-urgency missions due today — "Submit Report" (work), "Doctor Appointment" (health), and "Project Proposal" (work). I recommend tackling the report first.' },
                            { from: 'user', text: 'How productive was I this week?' },
                            { from: 'ai', text: 'You completed 7 of 10 missions this week — a 70% completion rate. Strong performance, Commander! 🚀' },
                        ].map((msg, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                            }}>
                                <div style={{
                                    maxWidth: '85%', padding: '10px 14px', fontSize: '13px', lineHeight: 1.6,
                                    borderRadius: msg.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: msg.from === 'user' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.06)',
                                    border: msg.from === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                    color: 'white',
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* ── FEATURES ── */}
            <section id="features" style={{ position: 'relative', zIndex: 10, padding: '40px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
                <AnimatedSection style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{
                        margin: 0, fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-1px',
                        background: 'linear-gradient(90deg, #fff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Mission Capabilities
                    </h2>
                    <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '16px' }}>Everything you need to command your day</p>
                </AnimatedSection>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px' }}>
                    {FEATURES.map((f, i) => (
                        <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} delay={i * 80} />
                    ))}
                </div>
            </section>

            {/* ── BOTTOM CTA ── */}
            <AnimatedSection style={{ position: 'relative', zIndex: 10, padding: '40px 24px 80px', textAlign: 'center' }}>
                <div style={{
                    maxWidth: '600px', margin: '0 auto', padding: '60px 40px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.1))',
                    border: '1px solid rgba(59,130,246,0.2)', borderRadius: '24px',
                    boxShadow: '0 0 80px rgba(59,130,246,0.12)',
                }}>
                    <div style={{ fontSize: '56px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>🛸</div>
                    <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-1px' }}>
                        Ready for Launch?
                    </h2>
                    <p style={{ margin: '0 0 32px', color: '#9ca3af', fontSize: '15px', lineHeight: 1.7 }}>
                        Join Mission Control. Sign in to start planning your missions in 3D space — free, forever.
                    </p>
                    <SignInButton mode="modal">
                        <button
                            onMouseEnter={() => SoundService.playHover()}
                            onClick={() => SoundService.playClick()}
                            style={{
                                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                                border: 'none', cursor: 'pointer', color: 'white',
                                padding: '16px 40px', borderRadius: '32px', fontWeight: 700, fontSize: '16px',
                                boxShadow: '0 0 40px rgba(59,130,246,0.5)',
                                transition: 'all 0.2s',
                            }}
                        >
                            🚀 Enter Mission Control
                        </button>
                    </SignInButton>
                </div>
            </AnimatedSection>

            {/* FOOTER */}
            <footer style={{
                position: 'relative', zIndex: 10, padding: '24px', textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.06)', color: '#4b5563', fontSize: '13px',
            }}>
                Zero-G Planner • Built for commanders who get things done 🛰️
            </footer>
        </div>
    );
}
