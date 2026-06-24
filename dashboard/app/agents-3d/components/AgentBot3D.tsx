'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'

interface AgentBot3DProps {
  position: [number, number, number]
  color: string
  name: string
  emoji: string
  isActive: boolean
}

export function AgentBot3D({ position, color, name, emoji, isActive }: AgentBot3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  // Animation du personnage
  useFrame((state) => {
    if (groupRef.current) {
      // Mouvement de flottement vertical si actif
      if (isActive) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
      }

      // Rotation légère sur lui-même
      groupRef.current.rotation.y += 0.01

      // Effet de "pulsation" si survolé
      const scale = hovered ? 1.1 : 1.0
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    }
  })

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={isActive ? 1 : 0.2}
    >
      <group
        ref={groupRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Corps principal - Capsule arrondie */}
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 0.5, 16, 16]} />
          <meshStandardMaterial
            color={color}
            roughness={0.3}
            metalness={0.1}
            emissive={isActive ? color : '#000000'}
            emissiveIntensity={isActive ? 0.2 : 0}
          />
        </mesh>

        {/* Tête - Sphère */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial
            color={color}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Visage - Yeux */}
        <mesh position={[-0.1, 0.65, 0.3]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.1, 0.65, 0.3]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Pupilles */}
        <mesh position={[-0.1, 0.65, 0.35]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.1, 0.65, 0.35]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

        {/* Bouche souriante */}
        <mesh position={[0, 0.5, 0.32]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.12, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

        {/* Antenne avec sphere au bout */}
        <mesh position={[0, 0.95, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.05, 1.1, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial
            color={isActive ? '#22c55e' : '#6b7280'}
            emissive={isActive ? '#22c55e' : '#000000'}
            emissiveIntensity={isActive ? 0.5 : 0}
          />
        </mesh>

        {/* Bras gauche */}
        <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, -0.5]} castShadow>
          <capsuleGeometry args={[0.08, 0.4, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>

        {/* Bras droit */}
        <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, 0.5]} castShadow>
          <capsuleGeometry args={[0.08, 0.4, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>

        {/* Jambes */}
        <mesh position={[-0.15, -0.5, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        <mesh position={[0.15, -0.5, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>

        {/* Pieds */}
        <mesh position={[-0.15, -0.8, 0.1]} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.25]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        <mesh position={[0.15, -0.8, 0.1]} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.25]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>

        {/* Nom de l'agent au-dessus */}
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {name}
        </Text>

        {/* Emoji au-dessus du nom */}
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.3}
          anchorX="center"
          anchorY="middle"
        >
          {emoji}
        </Text>

        {/* Indicateur d'activité - Halo lumineux */}
        {isActive && (
          <mesh position={[0, 0, 0]} scale={[1.2, 1.2, 1.2]}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.1}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </group>
    </Float>
  )
}
