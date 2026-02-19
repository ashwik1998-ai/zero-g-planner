import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTED = [
    'What are my most urgent missions?',
    'How many missions did I complete?',
    'Which category has the most tasks?',
    'Am I on track this week?',
];

export function AIChat({ onClose }: { onClose: () => void }) {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Commander, I'm ARIA — your AI mission co-pilot. I have full access to your mission logs. What would you like to know? 🛸" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sendMessage = async (text?: string) => {
        const msg = (text ?? input).trim();
        if (!msg || loading) return;

        const userMsg: Message = { role: 'user', content: msg };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const history = newMessages
                .slice(1) // skip system greeting
                .slice(-8)
                .map(m => ({ role: m.role, content: m.content }));

            const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.primaryEmailAddress?.emailAddress ?? user?.id,
                    message: msg,
                    history: history.slice(0, -1), // exclude the just-added user message
                }),
            });

            const data = await res.json();
            const reply = data.reply ?? data.error ?? 'Something went wrong.';
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Unable to reach the AI backend. Make sure the server is running.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{ position: 'fixed', inset: 0, zIndex: 299, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />

            {/* Panel */}
            <div style={{
                position: 'fixed', bottom: 0, right: 0,
                width: 'min(420px, 100vw)',
                height: 'min(600px, 90vh)',
                zIndex: 300,
                display: 'flex', flexDirection: 'column',
                background: 'rgba(5, 5, 20, 0.98)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 -20px 60px rgba(139,92,246,0.2), 0 0 0 1px rgba(139,92,246,0.1)',
                fontFamily: 'Inter, system-ui, sans-serif',
                animation: 'slideUp 0.3s ease',
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    flexShrink: 0,
                }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', flexShrink: 0,
                        boxShadow: '0 0 16px rgba(139,92,246,0.5)',
                    }}>🤖</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>ARIA</div>
                        <div style={{ fontSize: '11px', color: '#a78bfa', letterSpacing: '0.5px' }}>AI Mission Co-Pilot • Powered by Groq</div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.08)', border: 'none',
                        borderRadius: '8px', color: '#9ca3af', fontSize: '16px',
                        width: '32px', height: '32px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }} className="custom-scrollbar">
                    {messages.map((m, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '12px',
                        }}>
                            <div style={{
                                maxWidth: '80%',
                                padding: '10px 14px',
                                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                background: m.role === 'user'
                                    ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                                    : 'rgba(255,255,255,0.06)',
                                border: m.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                color: 'white',
                                fontSize: '14px',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                            }}>
                                {m.content}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px 16px 16px 4px',
                                display: 'flex', gap: '6px', alignItems: 'center',
                            }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: '#a78bfa',
                                        animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Suggestions (only when conversation is fresh) */}
                {messages.length <= 1 && (
                    <div style={{ padding: '0 16px 8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {SUGGESTED.map((s, i) => (
                            <button key={i} onClick={() => sendMessage(s)} style={{
                                padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                                color: '#c4b5fd', cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                            }}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div style={{
                    display: 'flex', gap: '10px',
                    padding: '12px 16px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    flexShrink: 0,
                }}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Ask about your missions..."
                        disabled={loading}
                        style={{
                            flex: 1, background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            borderRadius: '12px', padding: '10px 14px',
                            color: 'white', fontSize: '14px', outline: 'none',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            opacity: loading ? 0.6 : 1,
                        }}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        style={{
                            width: '42px', height: '42px', borderRadius: '12px', border: 'none',
                            background: input.trim() && !loading ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.08)',
                            color: 'white', fontSize: '18px', cursor: input.trim() && !loading ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', flexShrink: 0,
                            boxShadow: input.trim() && !loading ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                        }}
                    >↑</button>
                </div>
            </div>

            <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
        </>
    );
}
