import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CategoryRingProps {
    radius: number;
    color: string;
    opacity?: number;
}

export function CategoryRing({ radius, color, opacity = 0.1 }: CategoryRingProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Subtle rotation/pulsing animation
        meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    });

    return (
        <group rotation={[-Math.PI / 2, 0, 0]}>
            {/* Main Ring */}
            <mesh ref={meshRef}>
                <ringGeometry args={[radius - 0.015, radius + 0.015, 128]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={opacity}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Subtle Glow Ring */}
            <mesh>
                <ringGeometry args={[radius - 0.05, radius + 0.05, 128]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={opacity * 0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}
