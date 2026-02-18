import { Sparkles } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SpaceDebris() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_state, delta) => {
        if (groupRef.current) {
            // Slow rotation of the entire debris field
            groupRef.current.rotation.y += delta * 0.02;
            groupRef.current.rotation.x += delta * 0.01;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Background Dust */}
            <Sparkles
                count={2000}
                scale={40}
                size={2}
                speed={0.4}
                opacity={0.4}
                color="#88ccff"
            />
            {/* Closer slightly larger particles */}
            <Sparkles
                count={500}
                scale={30}
                size={5}
                speed={0.2}
                opacity={0.6}
                color="#ffffff"
            />
        </group>
    );
}
