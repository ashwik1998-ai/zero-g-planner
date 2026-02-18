import { Text, Billboard } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RADIUS = 18;
const TICK_COUNT = 48;

const MARKERS = Array.from({ length: 12 }, (_, i) => {
    const hours = i * 2;
    const label = hours === 0 ? '12 AM'
        : hours === 12 ? '12 PM'
            : hours < 12 ? `${hours} AM`
                : `${hours - 12} PM`;
    return { label, hours };
});

// Get fractional hours (0–24) in a given IANA timezone
function getHoursInTz(tz: string): number {
    try {
        const now = new Date();
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
        }).formatToParts(now);
        const h = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0');
        const m = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0');
        const s = parseInt(parts.find(p => p.type === 'second')?.value ?? '0');
        return (h % 24) + m / 60 + s / 3600;
    } catch {
        // Fallback to local time
        const now = new Date();
        return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    }
}

interface TimeRingProps {
    timezone?: string; // IANA timezone string, e.g. 'Asia/Kolkata'
}

export function TimeRing({ timezone = 'Asia/Kolkata' }: TimeRingProps) {
    const groupRef = useRef<THREE.Group>(null);
    const nowGroupRef = useRef<THREE.Group>(null);
    const nowLightRef = useRef<THREE.PointLight>(null);
    const nowOuterRef = useRef<THREE.Mesh>(null);
    // Store timezone in a ref so useFrame always has the latest value
    const tzRef = useRef(timezone);
    tzRef.current = timezone;

    useFrame((state, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.04;

        // Use the timezone from the ref (always up-to-date)
        const hours = getHoursInTz(tzRef.current);
        const theta = (hours / 24) * Math.PI * 2;
        const mx = Math.sin(theta) * RADIUS;
        const mz = Math.cos(theta) * RADIUS;

        if (nowGroupRef.current) nowGroupRef.current.position.set(mx, 0, mz);

        const t = state.clock.getElapsedTime();
        const pulse = 1 + Math.sin(t * 3) * 0.35;
        if (nowOuterRef.current) nowOuterRef.current.scale.setScalar(pulse);
        if (nowLightRef.current) nowLightRef.current.intensity = 1.8 + Math.sin(t * 3) * 0.6;
    });

    const tickLines = useMemo(() => {
        return Array.from({ length: TICK_COUNT }, (_, i) => {
            const hours = (i / TICK_COUNT) * 24;
            const theta = (hours / 24) * Math.PI * 2;
            const isMajor = i % 4 === 0;
            const innerR = isMajor ? RADIUS - 1.2 : RADIUS - 0.6;
            const outerR = RADIUS + 0.1;
            const points = [
                new THREE.Vector3(Math.sin(theta) * innerR, 0, Math.cos(theta) * innerR),
                new THREE.Vector3(Math.sin(theta) * outerR, 0, Math.cos(theta) * outerR),
            ];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({
                color: isMajor ? '#60a5fa' : '#1e3a5f',
                opacity: isMajor ? 0.9 : 0.5,
                transparent: true,
            });
            return new THREE.Line(geo, mat);
        });
    }, []);

    return (
        <group ref={groupRef}>
            {/* Outer glow ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[RADIUS - 0.05, RADIUS + 0.05, 128]} />
                <meshBasicMaterial color="#3b82f6" opacity={0.18} transparent side={THREE.DoubleSide} />
            </mesh>

            {/* Inner subtle ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[RADIUS - 0.5, RADIUS - 0.35, 128]} />
                <meshBasicMaterial color="#06b6d4" opacity={0.08} transparent side={THREE.DoubleSide} />
            </mesh>

            {/* Tick marks */}
            {tickLines.map((lineObj, i) => (
                <primitive key={i} object={lineObj} />
            ))}

            {/* Hour markers */}
            {MARKERS.map((marker) => {
                const theta = (marker.hours / 24) * Math.PI * 2;
                const labelR = RADIUS + 2.2;
                const dotR = RADIUS + 0.5;
                const lx = Math.sin(theta) * labelR;
                const lz = Math.cos(theta) * labelR;
                const dx = Math.sin(theta) * dotR;
                const dz = Math.cos(theta) * dotR;
                const isKeyHour = marker.hours === 0 || marker.hours === 12;

                return (
                    <group key={marker.label}>
                        <mesh position={[dx, 0, dz]}>
                            <sphereGeometry args={[isKeyHour ? 0.22 : 0.14, 12, 12]} />
                            <meshBasicMaterial color={isKeyHour ? '#ffffff' : '#60a5fa'} opacity={isKeyHour ? 1 : 0.75} transparent />
                        </mesh>
                        {isKeyHour && (
                            <pointLight position={[dx, 0, dz]} color="#60a5fa" intensity={0.6} distance={4} />
                        )}
                        <Billboard position={[lx, 0, lz]}>
                            <Text
                                color={isKeyHour ? '#ffffff' : '#93c5fd'}
                                fontSize={isKeyHour ? 0.7 : 0.55}
                                anchorX="center"
                                anchorY="middle"
                                outlineWidth={0.04}
                                outlineColor="#000000"
                                letterSpacing={0.02}
                            >
                                {marker.label}
                            </Text>
                        </Billboard>
                    </group>
                );
            })}

            {/* ── Current Time Marker (NOW) ── */}
            <group ref={nowGroupRef}>
                <mesh ref={nowOuterRef}>
                    <sphereGeometry args={[0.45, 16, 16]} />
                    <meshBasicMaterial color="#facc15" opacity={0.35} transparent depthWrite={false} />
                </mesh>
                <mesh>
                    <sphereGeometry args={[0.32, 12, 12]} />
                    <meshBasicMaterial color="#facc15" opacity={0.7} transparent />
                </mesh>
                <mesh>
                    <sphereGeometry args={[0.18, 12, 12]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <pointLight ref={nowLightRef} color="#facc15" intensity={2} distance={6} />
                <Billboard position={[0, 1.2, 0]}>
                    <Text
                        color="#facc15"
                        fontSize={0.52}
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.06}
                        outlineColor="#000000"
                        letterSpacing={0.05}
                    >
                        NOW
                    </Text>
                </Billboard>
            </group>
        </group>
    );
}
