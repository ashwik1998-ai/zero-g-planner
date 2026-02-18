import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { Task } from '../store/useTaskStore';

interface ConstellationLinesProps {
    tasks: Task[];
    getTaskPosition: (task: Task) => [number, number, number];
}

export function ConstellationLines({ tasks, getTaskPosition }: ConstellationLinesProps) {
    const linesRef = useRef<THREE.Group>(null);

    const groups = useMemo(() => {
        const map: Record<string, Task[]> = {};
        tasks.forEach(t => {
            if (t.groupId && t.status === 'active') {
                if (!map[t.groupId]) map[t.groupId] = [];
                map[t.groupId].push(t);
            }
        });
        return Object.values(map).filter(g => g.length > 1);
    }, [tasks]);

    useFrame((state) => {
        if (!linesRef.current) return;
        // Pulse effect
        const s = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
        linesRef.current.children.forEach(line => {
            if (line instanceof THREE.Line || (line as any).material) {
                (line as any).material.opacity = 0.3 * s;
            }
        });
    });

    return (
        <group ref={linesRef}>
            {groups.map((group, gi) => {
                const points = group.map(t => new THREE.Vector3(...getTaskPosition(t)));
                // Connect in a sequence for now
                return (
                    <Line
                        key={gi}
                        points={points}
                        color="#60a5fa"
                        lineWidth={1}
                        transparent
                        opacity={0.3}
                        dashed={false}
                    />
                );
            })}
        </group>
    );
}
