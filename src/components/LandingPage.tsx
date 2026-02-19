import { useEffect, useRef, useState } from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { SoundService } from '../services/SoundService';

const FEATURES = [
    {
        icon: '🪐',
        title: 'Orbital Mission View',
        desc: 'Visualize your tasks as planets orbiting a central star. Urgency = proximity. Time = angle. Your day, mapped to the cosmos.',
    },
    {
        icon: '🚀',
        title: 'Launch & Track',
        desc: 'Complete missions by launching them into orbit. Earn XP, level up, and watch your productivity soar.',
    },
    {
        icon: '📅',
        title: 'Mission Calendar',
        desc: 'Plan missions by date. Switch days instantly and see only what matters — no clutter, just your daily objectives.',
    },
    {
        icon: '☁️',
        title: 'Cloud Sync',
        desc: 'Your missions follow you everywhere. Sign in on any device and your data is instantly restored from the cloud.',
    },
    {
        icon: '🎮',
        title: 'Gamified XP System',
        desc: 'Every completed mission earns XP. Level up your commander rank and turn productivity into a game you actually want to play.',
    },
    {
        icon: '🎨',
        title: 'Dynamic Themes',
        desc: 'Switch between 5 space themes — Deep Space, Nebula Blue, Cosmic Purple, Aurora Green, and Red Dwarf.',
    },
];

// Hook: trigger animation when element enters viewport
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

// Animated star field canvas
function StarField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const stars = Array.from({ length: 300 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.8 + 0.3,
            alpha: Math.random(),
            speed: Math.random() * 0.006 + 0.002,
        }));
        let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(s => {
                s.alpha += s.speed;
                if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
                ctx.fill();
            });
            animId = requestAnimationFrame(draw);
        };
        draw();
        const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
}

// Orbiting planet animation for hero
function OrbitDemo() {
    const [angle, setAngle] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setAngle(a => a + 0.5), 16);
        return () => clearInterval(id);
    }, []);
    const planets = [
        { dist: 60, size: 10, color: '#ff4444', speed: 1, label: 'Urgent' },
        { dist: 90, size: 8, color: '#ffaa00', speed: 0.6, label: 'Normal' },
        { dist: 120, size: 7, color: '#00cc88', speed: 0.4, label: 'Casual' },
    ];
    return (
        <div style={{ position: 'relative', width: '280px', height: '280px', flexShrink: 0 }}>
            {planets.map((p, i) => (
                <div key={i} style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: p.dist * 2, height: p.dist * 2,
                    marginLeft: -p.dist, marginTop: -p.dist,
                    borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                    animation: `pulse-ring ${2 + i}s ease-in-out infinite`,
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
            }} />
            {planets.map((p, i) => {
                const a = (angle * p.speed + i * 120) * (Math.PI / 180);
                const x = 140 + Math.cos(a) * p.dist - p.size / 2;
                const y = 140 + Math.sin(a) * p.dist - p.size / 2;
                return (
                    <div key={i} style={{
                        position: 'absolute', left: x, top: y,
                        width: p.size, height: p.size, borderRadius: '50%',
                        background: p.color,
                        boxShadow: `0 0 14px ${p.color}, 0 0 28px ${p.color}55`,
                    }} />
                );
            })}
        </div>
    );
}

// Animated feature card
function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
    const { ref, inView } = useInView(0.1);
    return (
        <div
            ref={ref}
            style={{
                padding: '28px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, background 0.3s, border-color 0.3s`,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(40px)',
                cursor: 'default',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(59,130,246,0.08)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.3)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
        >
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>{icon}</div>
            <h3 style={{ margin: '0 0 10px', fontSize: '17px', fontWeight: 700, color: 'white' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: 1.7 }}>{desc}</p>
        </div>
    );
}

// Animated section wrapper
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

export function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => {
        // Kick off hero animation on mount
        const t = setTimeout(() => setHeroVisible(true), 100);
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#050510', color: 'white', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden', scrollBehavior: 'smooth' }}>
            {/* CSS keyframes injected inline */}
            <style>{`
                @keyframes sun-pulse {
                    0%, 100% { box-shadow: 0 0 24px #fff, 0 0 50px #ffd54f, 0 0 80px rgba(255,213,79,0.4); }
                    50% { box-shadow: 0 0 40px #fff, 0 0 80px #ffd54f, 0 0 120px rgba(255,213,79,0.6); }
                }
                @keyframes pulse-ring {
                    0%, 100% { border-color: rgba(255,255,255,0.06); }
                    50% { border-color: rgba(255,255,255,0.16); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes badge-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                html { scroll-behavior: smooth; }
            `}</style>

            <StarField />

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

            {/* HERO */}
            <section style={{
                position: 'relative', zIndex: 1,
                minHeight: '100vh',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '100px 24px 60px',
                gap: '32px',
            }}>
                {/* Live badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 18px', borderRadius: '24px',
                    background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    fontSize: '13px', color: '#60a5fa', fontWeight: 600,
                    animation: 'badge-pulse 2s ease-in-out infinite',
                    opacity: heroVisible ? 1 : 0,
                    transition: 'opacity 0.8s ease',
                }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', boxShadow: '0 0 8px #60a5fa' }} />
                    Mission Control is Live
                </div>

                {/* Headline */}
                <div style={{
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
                }}>
                    <h1 style={{
                        margin: 0, fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                        fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px',
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #06b6d4 100%)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            animation: 'gradient-shift 4s ease infinite',
                        }}>
                            Plan Your Day
                        </span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            animation: 'gradient-shift 4s ease infinite 1s',
                        }}>
                            Like a Commander
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
                                padding: '16px 36px', borderRadius: '32px',
                                fontWeight: 700, fontSize: '16px',
                                boxShadow: '0 0 40px rgba(59,130,246,0.5)',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                            }}
                        >
                            🚀 Start Your Mission
                        </button>
                    </SignInButton>
                    <a href="#features" style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer', color: 'white',
                        padding: '16px 32px', borderRadius: '32px',
                        fontWeight: 600, fontSize: '16px',
                        textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
                    }}>
                        See Features ↓
                    </a>
                </div>

                {/* Floating orbit demo */}
                <div style={{
                    marginTop: '10px',
                    padding: '30px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 80px rgba(59,130,246,0.1)',
                    animation: 'float 5s ease-in-out infinite',
                    opacity: heroVisible ? 1 : 0,
                    transition: 'opacity 0.8s ease 0.4s',
                }}>
                    <OrbitDemo />
                    <p style={{ margin: '16px 0 0', fontSize: '12px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Live Orbit Preview
                    </p>
                </div>
            </section>

            {/* STATS BAR */}
            <AnimatedSection style={{ position: 'relative', zIndex: 1, padding: '0 24px 60px' }}>
                <div style={{
                    maxWidth: '800px', margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '16px', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    {[
                        { num: '3D', label: 'Orbital View' },
                        { num: '5', label: 'Space Themes' },
                        { num: '∞', label: 'Missions' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            padding: '28px 20px', textAlign: 'center',
                            background: 'rgba(255,255,255,0.02)',
                        }}>
                            <div style={{
                                fontSize: '2.5rem', fontWeight: 900,
                                background: 'linear-gradient(135deg, #60a5fa, #06b6d4)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>{s.num}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </AnimatedSection>

            {/* FEATURES */}
            <section id="features" style={{ position: 'relative', zIndex: 1, padding: '40px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
                <AnimatedSection style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{
                        margin: 0, fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                        fontWeight: 800, letterSpacing: '-1px',
                        background: 'linear-gradient(90deg, #fff, #93c5fd)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Mission Capabilities
                    </h2>
                    <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '16px' }}>
                        Everything you need to command your day
                    </p>
                </AnimatedSection>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                    gap: '20px',
                }}>
                    {FEATURES.map((f, i) => (
                        <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} delay={i * 80} />
                    ))}
                </div>
            </section>

            {/* BOTTOM CTA */}
            <AnimatedSection style={{ position: 'relative', zIndex: 1, padding: '40px 24px 80px', textAlign: 'center' }}>
                <div style={{
                    maxWidth: '600px', margin: '0 auto',
                    padding: '60px 40px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.1))',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '24px',
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
                                padding: '16px 40px', borderRadius: '32px',
                                fontWeight: 700, fontSize: '16px',
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
                position: 'relative', zIndex: 1,
                padding: '24px', textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                color: '#4b5563', fontSize: '13px',
            }}>
                Zero-G Planner • Built for commanders who get things done 🛰️
            </footer>
        </div>
    );
}
