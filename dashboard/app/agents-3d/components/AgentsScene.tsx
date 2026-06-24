'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import { AgentBot3D } from './AgentBot3D'

interface Agent {
  name: string
  displayName: string
  emoji: string
  color: string
  isActive: boolean
}

interface AgentsSceneProps {
  agents: Agent[]
}

export function AgentsScene({ agents }: AgentsSceneProps) {
  // Disposition en cercle des agents
  const radius = 3
  const positions: [number, number, number][] = agents.map((_, index) => {
    const angle = (index / agents.length) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    return [x, 0, z]
  })

  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />

        {/* Lumières */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -5]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[10, 5, 10]} intensity={0.5} color="#f97316" />

        {/* Environnement */}
        <Environment preset="city" />

        {/* Sol avec ombres */}
        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={10}
        />

        {/* Plateforme centrale */}
        <mesh position={[0, -1.1, 0]} receiveShadow>
          <cylinderGeometry args={[5, 5, 0.2, 32]} />
          <meshStandardMaterial
            color="#111113"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Cercle lumineux sur la plateforme */}
        <mesh position={[0, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4, 4.8, 64]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.3} />
        </mesh>

        {/* Agents 3D */}
        {agents.map((agent, index) => (
          <AgentBot3D
            key={agent.name}
            position={positions[index]}
            color={agent.color}
            name={agent.displayName}
            emoji={agent.emoji}
            isActive={agent.isActive}
          />
        ))}

        {/* Particules décoratives */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = (Math.random() - 0.5) * 15
          const y = Math.random() * 8 + 2
          const z = (Math.random() - 0.5) * 15
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.6} />
            </mesh>
          )
        })}
      </Canvas>
    </div>
  )
}
