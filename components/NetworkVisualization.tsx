'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function NetworkNode({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.15, 32, 32]} position={position}>
      <meshStandardMaterial
        color="#3b82f6"
        emissive="#2563eb"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </Sphere>
  );
}

function ConnectionLine({ start, end }: { start: [number, number, number], end: [number, number, number] }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);

  return (
    <Line
      points={points}
      color="#3b82f6"
      lineWidth={1}
      opacity={0.3}
      transparent
    />
  );
}

function NetworkScene() {
  const nodes = useMemo(() => {
    const nodePositions: [number, number, number][] = [];
    const radius = 3;
    const count = 8;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 2;
      nodePositions.push([x, y, z]);
    }
    return nodePositions;
  }, []);

  const connections = useMemo(() => {
    const conns: Array<{ start: [number, number, number], end: [number, number, number] }> = [];
    nodes.forEach((node, i) => {
      const nextIndex = (i + 1) % nodes.length;
      conns.push({ start: node, end: nodes[nextIndex] });

      if (i % 2 === 0 && i + 2 < nodes.length) {
        conns.push({ start: node, end: nodes[i + 2] });
      }
    });
    return conns;
  }, [nodes]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {nodes.map((pos, i) => (
        <NetworkNode key={i} position={pos} />
      ))}

      {connections.map((conn, i) => (
        <ConnectionLine key={i} start={conn.start} end={conn.end} />
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function NetworkVisualization() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <NetworkScene />
      </Canvas>
    </div>
  );
}
