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

        const stars = Array.from({ length: 200 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.3,
            alpha: Math.random(),
            speed: Math.random() * 0.005 + 0.002,
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

        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
        />
    );
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
            {/* Orbit rings */}
            {planets.map((p, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: p.dist * 2, height: p.dist * 2,
                    marginLeft: -p.dist, marginTop: -p.dist,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.08)',
                }} />
            ))}

            {/* Sun */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 24, height: 24,
                marginLeft: -12, marginTop: -12,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fff 0%, #fffde7 40%, #ffd54f 100%)',
                boxShadow: '0 0 20px #fff, 0 0 40px #ffd54f, 0 0 60px rgba(255,213,79,0.5)',
            }} />

            {/* Planets */}
            {planets.map((p, i) => {
                const a = (angle * p.speed + i * 120) * (Math.PI / 180);
                const x = 140 + Math.cos(a) * p.dist - p.size / 2;
                const y = 140 + Math.sin(a) * p.dist - p.size / 2;
                return (
                    <div key={i} style={{
                        position: 'absolute',
                        left: x, top: y,
                        width: p.size, height: p.size,
                        borderRadius: '50%',
                        background: p.color,
                        boxShadow: `0 0 10px ${p.color}`,
                        transition: 'none',
                    }} />
                );
            })}
        </div>
    );
}

export function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#050510', color: 'white', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #60a5fa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Zero-G Planner
                    </span>
                </div>
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
                gap: '40px',
            }}>
                {/* Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 16px', borderRadius: '24px',
                    background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    fontSize: '13px', color: '#60a5fa', fontWeight: 600,
                }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', boxShadow: '0 0 8px #60a5fa' }} />
                    Mission Control is Live
                </div>

                {/* Headline */}
                <div>
                    <h1 style={{
                        margin: 0, fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                        fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px',
                    }}>
                        <span style={{ background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Plan Your Day
                        </span>
                        <br />
                        <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Like a Commander
                        </span>
                    </h1>
                    <p style={{
                        marginTop: '24px', fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        color: '#9ca3af', maxWidth: '560px', lineHeight: 1.7,
                        marginLeft: 'auto', marginRight: 'auto',
                    }}>
                        Zero-G Planner turns your daily tasks into orbital missions. Visualize urgency in 3D space, earn XP for completing goals, and sync everything to the cloud.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <SignInButton mode="modal">
                        <button
                            onMouseEnter={() => SoundService.playHover()}
                            onClick={() => SoundService.playClick()}
                            style={{
                                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                                border: 'none', cursor: 'pointer', color: 'white',
                                padding: '14px 32px', borderRadius: '32px',
                                fontWeight: 700, fontSize: '16px',
                                boxShadow: '0 0 30px rgba(59,130,246,0.5)',
                                transition: 'all 0.2s',
                            }}
                        >
                            🚀 Start Your Mission
                        </button>
                    </SignInButton>
                    <a
                        href="#features"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            cursor: 'pointer', color: 'white',
                            padding: '14px 32px', borderRadius: '32px',
                            fontWeight: 600, fontSize: '16px',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        See Features ↓
                    </a>
                </div>

                {/* Orbit Demo */}
                <div style={{
                    marginTop: '20px',
                    padding: '30px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 60px rgba(59,130,246,0.1)',
                }}>
                    <OrbitDemo />
                    <p style={{ margin: '16px 0 0', fontSize: '12px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Live Orbit Preview
                    </p>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
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
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                }}>
                    {FEATURES.map((f, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '28px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px',
                                transition: 'all 0.3s',
                                cursor: 'default',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.background = 'rgba(59,130,246,0.08)';
                                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.3)';
                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
                            <h3 style={{ margin: '0 0 10px', fontSize: '17px', fontWeight: 700, color: 'white' }}>{f.title}</h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* BOTTOM CTA */}
            <section style={{
                position: 'relative', zIndex: 1,
                padding: '80px 24px',
                textAlign: 'center',
            }}>
                <div style={{
                    maxWidth: '600px', margin: '0 auto',
                    padding: '60px 40px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.1))',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '24px',
                    boxShadow: '0 0 60px rgba(59,130,246,0.1)',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛸</div>
                    <h2 style={{ margin: '0 0 16px', fontSize: '2rem', fontWeight: 800, letterSpacing: '-1px' }}>
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
                                padding: '14px 36px', borderRadius: '32px',
                                fontWeight: 700, fontSize: '16px',
                                boxShadow: '0 0 30px rgba(59,130,246,0.5)',
                                transition: 'all 0.2s',
                            }}
                        >
                            🚀 Enter Mission Control
                        </button>
                    </SignInButton>
                </div>
            </section>

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
