import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../store/useTaskStore';

interface TaskBubbleProps {
    task: Task;
    onEdit?: () => void;
    onFocus?: () => void;
    activeBubbleId: string | null;
    setActiveBubbleId: (id: string | null) => void;
}

const MIN_DISTANCE = 4;
const HOURS_TO_DISTANCE = 0.5;
const MAX_DISTANCE = 20;

export function TaskBubble({ task, onEdit, onFocus, activeBubbleId, setActiveBubbleId }: TaskBubbleProps) {
    const level = useTaskStore(state => state.level);
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const timerRef = useRef<any>(null);

    const isActive = activeBubbleId === task.id;

    // Level-based visual tiers
    const isPilot = level >= 2;
    const isCommander = level >= 3;
    const isAce = level >= 4;

    // Auto-hide timer
    useEffect(() => {
        if (isActive) {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                setActiveBubbleId(null);
            }, 3000);
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [isActive, setActiveBubbleId]);

    const targetPosition = useMemo(() => {
        const now = new Date().getTime();
        const deadline = new Date(task.deadline).getTime();
        const diffHours = (deadline - now) / (1000 * 60 * 60);
        let r = MIN_DISTANCE + Math.max(0, diffHours) * HOURS_TO_DISTANCE;
        r = Math.min(r, MAX_DISTANCE);

        const date = new Date(task.deadline);
        const hours = date.getHours() + date.getMinutes() / 60;
        const theta = (hours / 24) * Math.PI * 2;
        const phi = (Math.PI / 2) + (Math.random() - 0.5) * 0.5;

        return new THREE.Vector3().setFromSphericalCoords(r, phi, theta);
    }, [task.deadline]);

    useEffect(() => {
        if (task.status === 'completed') {
            setIsLaunching(true);
        } else {
            setIsLaunching(false);
            if (groupRef.current) groupRef.current.scale.setScalar(1);
        }
    }, [task.status]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (isLaunching) {
            const direction = groupRef.current.position.clone().normalize();
            groupRef.current.position.add(direction.multiplyScalar(20 * delta));
            const s = groupRef.current.scale.x;
            if (s > 0.01) groupRef.current.scale.setScalar(THREE.MathUtils.lerp(s, 0, delta * 2));
        } else {
            groupRef.current.position.lerp(targetPosition, delta * 2);

            const time = state.clock.getElapsedTime();
            const offset = task.id.charCodeAt(0);

            if (meshRef.current) {
                meshRef.current.position.set(
                    Math.cos(time * 0.5 + offset) * 0.1,
                    Math.sin(time + offset) * 0.2,
                    0
                );
                meshRef.current.rotation.x = time * 0.2;
                meshRef.current.rotation.z = time * 0.1;
            }

            // Pulse the glow
            if (glowRef.current) {
                const pulse = 1 + Math.sin(time * 2 + offset) * 0.08;
                glowRef.current.scale.setScalar(pulse);
                (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
                    hovered ? 0.35 : 0.18 + Math.sin(time * 2 + offset) * 0.06;
            }
        }
    });

    const color = useMemo(() => {
        if (task.color) return task.color;
        const now = new Date().getTime();
        const deadline = new Date(task.deadline).getTime();
        if (deadline < now) return '#ff4444';
        if (deadline - now < 1000 * 60 * 60 * 24) return '#ffaa00';
        return '#44aaff';
    }, [task.deadline, task.color]);

    // Brighter, more saturated version of the color for glow
    const glowColor = useMemo(() => color, [color]);

    const baseSize = hovered || isActive ? 0.85 : 0.65;

    return (
        <group ref={groupRef} position={targetPosition}>
            {/* Satellite / Moon for Level 3+ (Commander) */}
            {isCommander && (
                <group>
                    <mesh position={[1.5, Math.sin(Date.now() / 1000) * 0.5, 0]}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
                    </mesh>
                </group>
            )}
            <mesh
                ref={meshRef}
                onClick={e => {
                    if (isLaunching) return;
                    e.stopPropagation();
                    if (isActive) {
                        setActiveBubbleId(null); // Toggle off if already active
                    } else {
                        setActiveBubbleId(task.id);
                    }
                }}
                onPointerOver={() => {
                    if (isLaunching) return;
                    document.body.style.cursor = 'pointer';
                    setHovered(true);
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'auto';
                    setHovered(false);
                }}
            >
                <sphereGeometry args={[baseSize, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered || isActive ? 3.5 : (isPilot ? 2.5 : 1.8)}
                    roughness={isAce ? 0.05 : 0.15}
                    metalness={isAce ? 0.8 : 0.3}
                    transparent={false}
                />

                {/* Outer glow shell */}
                <mesh ref={glowRef}>
                    <sphereGeometry args={[baseSize * 1.6, 16, 16]} />
                    <meshBasicMaterial
                        color={glowColor}
                        transparent
                        opacity={0.18}
                        side={THREE.BackSide}
                        depthWrite={false}
                    />
                </mesh>

                {/* Point light emanating from planet */}
                <pointLight
                    color={color}
                    intensity={hovered || isActive ? 4 : 2.5}
                    distance={6}
                    decay={2}
                />

                {/* Title label */}
                {!isLaunching && (
                    <Billboard position={[0, baseSize + 0.7, 0]}>
                        <Text
                            fontSize={0.38}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                            outlineWidth={0.05}
                            outlineColor="#000000"
                        >
                            {task.title}
                        </Text>
                    </Billboard>
                )}

                {/* Tooltip (Hover or Clicked) */}
                {(hovered || isActive) && !isLaunching && (
                    <Html position={[0, -baseSize - 1.2, 0]} center zIndexRange={[100, 0]}>
                        <div
                            onPointerOver={() => { if (timerRef.current) clearTimeout(timerRef.current); }}
                            onPointerOut={() => {
                                if (isActive) {
                                    timerRef.current = setTimeout(() => setActiveBubbleId(null), 3000);
                                }
                            }}
                            style={{
                                background: 'rgba(5,5,16,0.95)',
                                border: `1px solid ${color}55`,
                                borderRadius: '12px',
                                padding: '12px 14px',
                                color: 'white',
                                fontSize: '12px',
                                width: '180px',
                                textAlign: 'center',
                                backdropFilter: 'blur(8px)',
                                boxShadow: `0 0 30px ${color}33`,
                                fontFamily: 'Inter, system-ui, sans-serif',
                                pointerEvents: 'auto',
                            }}
                        >
                            <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: '13px' }}>{task.title}</p>
                            <p style={{ margin: '0 0 8px', color: '#9ca3af', fontSize: '11px', opacity: 0.8 }}>
                                {new Date(task.deadline).toLocaleDateString()} @ {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onFocus?.(); }}
                                    style={{
                                        background: 'rgba(59,130,246,0.2)',
                                        border: '1px solid rgba(59,130,246,0.4)',
                                        borderRadius: '8px', color: '#60a5fa',
                                        padding: '6px', fontSize: '11px', fontWeight: 700,
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.3)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                                >
                                    🚀 Start Focus Session
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', color: '#d1d5db',
                                        padding: '6px', fontSize: '11px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✏️ Edit Mission
                                </button>
                            </div>
                        </div>
                    </Html>
                )}
            </mesh>
        </group>
    );
}
