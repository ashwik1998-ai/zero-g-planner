import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ASTEROID_COUNT = 40;
const BELT_RADIUS = 7.5;
const BELT_WIDTH = 1.2;

// Pre-generate asteroid positions/sizes/speeds
const asteroids = Array.from({ length: ASTEROID_COUNT }, (_, i) => ({
    angle: (i / ASTEROID_COUNT) * Math.PI * 2 + Math.random() * 0.3,
    radius: BELT_RADIUS + (Math.random() - 0.5) * BELT_WIDTH,
    y: (Math.random() - 0.5) * 0.4,
    size: 0.04 + Math.random() * 0.08,
    speed: 0.003 + Math.random() * 0.004,
    rotSpeed: (Math.random() - 0.5) * 0.05,
}));

export function AsteroidBelt() {
    const groupRef = useRef<THREE.Group>(null);
    const anglesRef = useRef(asteroids.map(a => a.angle));

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        asteroids.forEach((a, i) => {
            anglesRef.current[i] += a.speed * delta;
            const mesh = groupRef.current!.children[i] as THREE.Mesh;
            if (!mesh) return;
            mesh.position.x = Math.sin(anglesRef.current[i]) * a.radius;
            mesh.position.z = Math.cos(anglesRef.current[i]) * a.radius;
            mesh.position.y = a.y;
            mesh.rotation.x += a.rotSpeed * delta;
            mesh.rotation.y += a.rotSpeed * 0.7 * delta;
        });
    });

    return (
        <group ref={groupRef}>
            {asteroids.map((a, i) => (
                <mesh key={i} position={[Math.sin(a.angle) * a.radius, a.y, Math.cos(a.angle) * a.radius]}>
                    <dodecahedronGeometry args={[a.size, 0]} />
                    <meshStandardMaterial
                        color="#ef4444"
                        emissive="#7f1d1d"
                        emissiveIntensity={0.4}
                        roughness={0.9}
                        metalness={0.1}
                    />
                </mesh>
            ))}
            {/* Belt glow ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[BELT_RADIUS - BELT_WIDTH / 2, BELT_RADIUS + BELT_WIDTH / 2, 128]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.04} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}
