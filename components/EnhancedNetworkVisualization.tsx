'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function Particle({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.001;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.02, 8, 8]} position={position}>
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
    </Sphere>
  );
}

function ServiceNode({ position, color, isActive }: { position: [number, number, number], color: string, isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
    if (pulseRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      pulseRef.current.scale.setScalar(scale);
      const material = pulseRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 - (scale - 1) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Pulse effect when active */}
      {isActive && (
        <Sphere ref={pulseRef} args={[0.35, 32, 32]}>
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </Sphere>
      )}

      {/* Glow effect */}
      <Sphere ref={glowRef} args={[0.25, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </Sphere>

      {/* Main node */}
      <Sphere ref={meshRef} args={[0.18, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.8 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
    </group>
  );
}

function TrafficPacket({
  start,
  end,
  delay,
  color
}: {
  start: [number, number, number],
  end: [number, number, number],
  delay: number,
  color: string
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      // Calculate progress along the path (0 to 1)
      const t = ((state.clock.elapsedTime + delay) % 2) / 2;
      setProgress(t);

      // Interpolate position between start and end
      const x = start[0] + (end[0] - start[0]) * t;
      const y = start[1] + (end[1] - start[1]) * t;
      const z = start[2] + (end[2] - start[2]) * t;

      meshRef.current.position.set(x, y, z);

      // Make packet pulse
      const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
      meshRef.current.scale.setScalar(scale);

      // Fade in/out at start and end
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      if (t < 0.1) {
        material.opacity = t / 0.1;
      } else if (t > 0.9) {
        material.opacity = (1 - t) / 0.1;
      } else {
        material.opacity = 1;
      }
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.08, 16, 16]} position={start}>
      <meshBasicMaterial color={color} transparent opacity={1} />
    </Sphere>
  );
}

function AnimatedLine({
  start,
  end,
  delay = 0,
  isActive
}: {
  start: [number, number, number],
  end: [number, number, number],
  delay?: number,
  isActive: boolean
}) {
  const lineRef = useRef<THREE.Line>(null);

  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      if (isActive) {
        material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3 + delay) * 0.3;
      } else {
        material.opacity = 0.2;
      }
    }
  });

  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: isActive ? "#3b82f6" : "#475569",
      transparent: true,
      opacity: 0.3,
    });
  }, [isActive]);

  const line = useMemo(() => {
    return new THREE.Line(geometry, material);
  }, [geometry, material]);

  return <primitive object={line} ref={lineRef} />;
}

function NetworkScene() {
  // Service nodes representing microservices architecture
  const services = useMemo(() => [
    { pos: [0, 0, 0] as [number, number, number], color: '#3b82f6', name: 'Gateway' },
    { pos: [4, 2, 0] as [number, number, number], color: '#10b981', name: 'Auth' },
    { pos: [4, -2, 0] as [number, number, number], color: '#f59e0b', name: 'Payment' },
    { pos: [-4, 2, 0] as [number, number, number], color: '#8b5cf6', name: 'Order' },
    { pos: [-4, -2, 0] as [number, number, number], color: '#ec4899', name: 'User' },
    { pos: [0, 3.5, -2] as [number, number, number], color: '#06b6d4', name: 'Cache' },
    { pos: [0, -3.5, -2] as [number, number, number], color: '#ef4444', name: 'Queue' },
    { pos: [0, 0, 4] as [number, number, number], color: '#14b8a6', name: 'DB' },
  ], []);

  // Generate particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 12;
      temp.push([x, y, z] as [number, number, number]);
    }
    return temp;
  }, []);

  // Define traffic flows with different colors and speeds
  const trafficFlows = useMemo(() => [
    // Gateway to services
    { start: services[0].pos, end: services[1].pos, delay: 0, color: '#10b981' },
    { start: services[0].pos, end: services[2].pos, delay: 0.3, color: '#f59e0b' },
    { start: services[0].pos, end: services[3].pos, delay: 0.6, color: '#8b5cf6' },
    { start: services[0].pos, end: services[4].pos, delay: 0.9, color: '#ec4899' },

    // Services to Cache
    { start: services[1].pos, end: services[5].pos, delay: 1.2, color: '#06b6d4' },
    { start: services[4].pos, end: services[5].pos, delay: 1.5, color: '#06b6d4' },

    // Services to Queue
    { start: services[2].pos, end: services[6].pos, delay: 1.8, color: '#ef4444' },
    { start: services[3].pos, end: services[6].pos, delay: 2.1, color: '#ef4444' },

    // Services to DB
    { start: services[1].pos, end: services[7].pos, delay: 2.4, color: '#14b8a6' },
    { start: services[2].pos, end: services[7].pos, delay: 2.7, color: '#14b8a6' },
    { start: services[3].pos, end: services[7].pos, delay: 3.0, color: '#14b8a6' },
    { start: services[4].pos, end: services[7].pos, delay: 3.3, color: '#14b8a6' },

    // Return flows (DB back to services)
    { start: services[7].pos, end: services[1].pos, delay: 3.6, color: '#3b82f6' },
    { start: services[7].pos, end: services[3].pos, delay: 3.9, color: '#3b82f6' },

    // Additional cross-service communication
    { start: services[3].pos, end: services[2].pos, delay: 4.2, color: '#fbbf24' },
    { start: services[4].pos, end: services[1].pos, delay: 4.5, color: '#a78bfa' },
  ], [services]);

  // Connections between services
  const connections = useMemo(() => {
    const activeConnections = new Set<string>();
    trafficFlows.forEach(flow => {
      const key = `${flow.start.join(',')}-${flow.end.join(',')}`;
      activeConnections.add(key);
    });

    return [
      { start: services[0].pos, end: services[1].pos, isActive: true },
      { start: services[0].pos, end: services[2].pos, isActive: true },
      { start: services[0].pos, end: services[3].pos, isActive: true },
      { start: services[0].pos, end: services[4].pos, isActive: true },
      { start: services[1].pos, end: services[5].pos, isActive: true },
      { start: services[4].pos, end: services[5].pos, isActive: true },
      { start: services[2].pos, end: services[6].pos, isActive: true },
      { start: services[3].pos, end: services[6].pos, isActive: true },
      { start: services[1].pos, end: services[7].pos, isActive: true },
      { start: services[2].pos, end: services[7].pos, isActive: true },
      { start: services[3].pos, end: services[7].pos, isActive: true },
      { start: services[4].pos, end: services[7].pos, isActive: true },
      { start: services[3].pos, end: services[2].pos, isActive: true },
      { start: services[4].pos, end: services[1].pos, isActive: true },
    ];
  }, [services, trafficFlows]);

  // Active nodes (nodes that are currently sending/receiving traffic)
  const activeNodes = useMemo(() => new Set([0, 1, 2, 3, 4, 5, 6, 7]), []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <spotLight position={[0, 5, 0]} intensity={0.5} color="#10b981" />

      {/* Background particles */}
      {particles.map((pos, i) => (
        <Particle key={`particle-${i}`} position={pos} />
      ))}

      {/* Connection lines */}
      {connections.map((conn, i) => (
        <AnimatedLine
          key={`conn-${i}`}
          start={conn.start}
          end={conn.end}
          delay={i * 0.5}
          isActive={conn.isActive}
        />
      ))}

      {/* Service nodes */}
      {services.map((service, i) => (
        <ServiceNode
          key={`service-${i}`}
          position={service.pos}
          color={service.color}
          isActive={activeNodes.has(i)}
        />
      ))}

      {/* Traffic packets flowing between services */}
      {trafficFlows.map((flow, i) => (
        <TrafficPacket
          key={`traffic-${i}`}
          start={flow.start}
          end={flow.end}
          delay={flow.delay}
          color={flow.color}
        />
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

export default function EnhancedNetworkVisualization() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <NetworkScene />
      </Canvas>
    </div>
  );
}
