import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const MinimalParticles = () => {
  const pointsRef = useRef<THREE.Points>(null!);
  
  // Create a clean sphere of particles
  const particleCount = 600;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const radius = 6;
    
    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution for uniform sphere coverage
      const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      // Very slow, elegant rotation
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#ffffff"
          transparent
          opacity={0.4}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </Float>
  );
};

const Scene = () => {
  try {
    return (
      <div className="fixed inset-0 z-0 bg-[#050505]">
        <Canvas gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 14]} fov={45} />
          
          <MinimalParticles />
          
          {/* Subtle fog for depth fade */}
          <fog attach="fog" args={['#050505', 10, 25]} />
        </Canvas>
      </div>
    );
  } catch (error) {
    console.error('Scene rendering error:', error);
    // Fallback to simple background if 3D fails
    return <div className="fixed inset-0 z-0 bg-[#050505]" />;
  }
};

export default Scene;