import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BlackHoleProps {
    position: [number, number, number];
    onDone: () => void;
}

export function BlackHole({ position, onDone }: BlackHoleProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [t, setT] = useState(0);

    useEffect(() => {
        const timer = setTimeout(onDone, 1800);
        return () => clearTimeout(timer);
    }, [onDone]);

    useFrame((_, delta) => {
        setT(prev => prev + delta);
        if (!groupRef.current) return;
        // Spiral inward and shrink
        const progress = Math.min(t / 1.8, 1);
        const scale = 1 - progress * 0.9;
        groupRef.current.scale.setScalar(scale);
        groupRef.current.rotation.y += delta * (2 + progress * 8);
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Black sphere */}
            <mesh>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
            {/* Accretion disk */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.28, 0.6, 64]} />
                <meshBasicMaterial color="#7c3aed" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[Math.PI / 2 + 0.3, 0, 0]}>
                <ringGeometry args={[0.32, 0.55, 64]} />
                <meshBasicMaterial color="#c084fc" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
            {/* Glow */}
            <pointLight color="#7c3aed" intensity={3} distance={3} />
        </group>
    );
}
