import { Text, Billboard } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function TimeRing() {
    const radius = 18;

    // Create markers for every 3 hours
    const markers = [
        { label: '12 AM', hours: 0 },
        { label: '3 AM', hours: 3 },
        { label: '6 AM', hours: 6 },
        { label: '9 AM', hours: 9 },
        { label: '12 PM', hours: 12 },
        { label: '3 PM', hours: 15 },
        { label: '6 PM', hours: 18 },
        { label: '9 PM', hours: 21 },
    ];

    const groupRef = useRef<THREE.Group>(null);

    useFrame((_state, delta) => {
        if (groupRef.current) {
            // Slow rotation for "Space Station" feel
            groupRef.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <group ref={groupRef} rotation={[0, 0, 0]}>
            {/* Visual Ring Line */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius - 0.1, radius, 64]} />
                <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
            </mesh>

            {/* Hour Markers */}
            {markers.map((marker) => {
                const theta = (marker.hours / 24) * Math.PI * 2;
                // x = r * sin(theta) if aligning with TaskBubble
                const x = radius * Math.sin(theta);
                const z = radius * Math.cos(theta);

                return (
                    <group key={marker.label} position={[x, 0, z]}>
                        <Billboard>
                            <Text
                                color="white"
                                fontSize={0.8}
                                maxWidth={200}
                                lineHeight={1}
                                letterSpacing={0.02}
                                textAlign="center"
                                anchorX="center"
                                anchorY="middle"
                                outlineWidth={0.05}
                                outlineColor="#000000"
                            >
                                {marker.label}
                            </Text>
                        </Billboard>
                        <mesh position={[0, -1, 0]}>
                            <sphereGeometry args={[0.2]} />
                            <meshBasicMaterial color="white" opacity={0.5} transparent />
                        </mesh>
                    </group>
                );
            })}
        </group>
    )
}
