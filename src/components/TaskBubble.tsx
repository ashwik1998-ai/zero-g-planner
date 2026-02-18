import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { Task } from '../store/useTaskStore';

interface TaskBubbleProps {
    task: Task;
    onEdit?: () => void;
}

const MIN_DISTANCE = 4;
const HOURS_TO_DISTANCE = 0.5;
const MAX_DISTANCE = 20;

export function TaskBubble({ task, onEdit }: TaskBubbleProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);

    // Position Logic
    const targetPosition = useMemo(() => {
        const now = new Date().getTime();
        const deadline = new Date(task.deadline).getTime();

        // DISTANCE = Urgency
        const diffHours = (deadline - now) / (1000 * 60 * 60);
        // If overdue, it should be very close
        let r = MIN_DISTANCE + Math.max(0, diffHours) * HOURS_TO_DISTANCE;
        r = Math.min(r, MAX_DISTANCE);

        // ANGLE = Time of Day
        const date = new Date(task.deadline);
        const hours = date.getHours() + date.getMinutes() / 60;
        const theta = (hours / 24) * Math.PI * 2; // 0..2PI

        // ELEVATION
        const phi = (Math.PI / 2) + (Math.random() - 0.5) * 0.5;

        // XYZ
        return new THREE.Vector3().setFromSphericalCoords(r, phi, theta);
    }, [task.deadline]);

    // Detect completion
    useEffect(() => {
        if (task.status === 'completed') {
            setIsLaunching(true);
        } else {
            setIsLaunching(false);
            // Reset scale instantly so it appears
            if (groupRef.current) {
                groupRef.current.scale.setScalar(1);
            }
        }
    }, [task.status]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (isLaunching) {
            // LAUNCH ANIMATION
            const direction = groupRef.current.position.clone().normalize();
            const speed = 20 * delta;
            groupRef.current.position.add(direction.multiplyScalar(speed));

            // Scale down
            const currentScale = groupRef.current.scale.x;
            if (currentScale > 0.01) {
                const newScale = THREE.MathUtils.lerp(currentScale, 0, delta * 2);
                groupRef.current.scale.setScalar(newScale);
            }
        } else {
            // IDLE ANIMATION
            groupRef.current.position.lerp(targetPosition, delta * 2);

            const time = state.clock.getElapsedTime();
            const randomOffset = task.id.charCodeAt(0);

            const yNoise = Math.sin(time + randomOffset) * 0.2;
            const xNoise = Math.cos(time * 0.5 + randomOffset) * 0.1;

            if (meshRef.current) {
                meshRef.current.position.set(xNoise, yNoise, 0);
                meshRef.current.rotation.x = time * 0.2;
                meshRef.current.rotation.z = time * 0.1;
            }
        }
    });

    const color = useMemo(() => {
        if (task.color) return task.color;
        const now = new Date().getTime();
        const deadline = new Date(task.deadline).getTime();
        if (deadline < now) return '#ff4444'; // Overdue: Red
        if (deadline - now < 1000 * 60 * 60 * 24) return '#ffaa00'; // Due soon: Orange
        return '#44aaff'; // Normal: Blue
    }, [task.deadline, task.color]);

    const handlePointerOver = () => {
        if (isLaunching) return;
        document.body.style.cursor = 'pointer';
        setHovered(true);
    }

    const handlePointerOut = () => {
        document.body.style.cursor = 'auto';
        setHovered(false);
    }

    const handleClick = (e: any) => {
        if (isLaunching) return;
        e.stopPropagation();
        if (onEdit) onEdit();
    }

    return (
        <group ref={groupRef} position={targetPosition}>
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <sphereGeometry args={[hovered ? 0.8 : 0.6, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={isLaunching ? 1 : 0.8}
                    emissive={color}
                    emissiveIntensity={isLaunching ? 2 : (hovered ? 0.8 : 0.4)}
                    roughness={0.2}
                    metalness={0.8}
                />

                {/* Title Label attached to mesh */}
                {!isLaunching && (
                    <Billboard position={[0, 1.2, 0]}>
                        <Text
                            fontSize={0.4}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                            outlineWidth={0.03}
                            outlineColor="#000000"
                        >
                            {task.title}
                        </Text>
                    </Billboard>
                )}

                {/* Hover Details - SIMPLIFIED */}
                {hovered && !isLaunching && (
                    <Html position={[0, -1.5, 0]} center zIndexRange={[100, 0]}>
                        <div className="bg-black/90 text-white p-3 rounded-lg border border-white/20 text-sm w-40 text-center backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] select-none pointer-events-none">
                            <p className="font-bold mb-1">{task.title}</p>
                            <div className="text-xs text-gray-300 mb-2">
                                <p>{new Date(task.deadline).toLocaleDateString()}</p>
                                <p>{new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>

                        </div>
                    </Html>
                )}
            </mesh>
        </group>
    );
}
