import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';

function ConstructionSite({ config }) {
  const group = useRef();
  const [hoveredPart, setHoveredPart] = useState(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 4) * 0.2;
  });

  const parts = config.parts || [
    { id: 'fondations', position: [0, 0.5, 0], args: [4, 1, 4], color: '#334155', name: 'Fondations Coulées' },
    { id: 'rdc', position: [0, 2, 0], args: [3.8, 2, 3.8], color: '#64748b', name: 'RDC - Maçonnerie en cours' },
    { id: 'etage1', position: [-0.5, 4, 0], args: [2.8, 2, 3.8], color: '#94a3b8', name: 'Étage 1 - En attente' },
  ];

  return (
    <group ref={group}>
      {parts.map((part) => (
        <mesh 
          key={part.id} 
          position={part.position}
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart(part); }}
          onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null); }}
        >
          <boxGeometry args={part.args} />
          <meshStandardMaterial 
            color={hoveredPart?.id === part.id ? '#00d2ff' : part.color} 
            wireframe={part.id === 'etage1'} // Le dernier étage est en wireframe pour simuler l'échafaudage
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Grue simplifiée - optionnelle */}
      {config.showCrane !== false && (
        <>
          <mesh position={[2.5, 4, -2]}>
            <cylinderGeometry args={[0.1, 0.1, 8]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
          <mesh position={[1, 7.9, -2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 4]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
          {/* Filin de la grue */}
          <mesh position={[-0.9, 6.4, -2]}>
            <cylinderGeometry args={[0.02, 0.02, 3]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Charge de la grue */}
          <mesh position={[-0.9, 4.8, -2]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </>
      )}

      {/* Affichage du texte au survol */}
      {hoveredPart && (
        <Text 
          position={[0, 6, 2]} 
          fontSize={0.4} 
          color="#00d2ff"
          anchorX="center"
          anchorY="middle"
        >
          {hoveredPart.name}
        </Text>
      )}
    </group>
  );
}

export default function BimViewer({ content }) {
  let config = {};
  try {
    if (content) {
      config = JSON.parse(content);
    }
  } catch (e) {}

  return (
    <div style={{ 
      width: '100%', 
      height: '400px', 
      background: 'rgba(0,0,0,0.3)', 
      borderRadius: '16px', 
      border: '1px solid var(--glass-border)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 10,
        background: 'rgba(0,0,0,0.5)',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        color: 'white',
        border: '1px solid var(--glass-border)',
        pointerEvents: 'none'
      }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-primary)' }}>Visionneuse BIM</h4>
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-dim)' }}>Interagissez avec le modèle (survol et rotation)</p>
      </div>

      <Canvas camera={{ position: [6, 6, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <ConstructionSite config={config} />
        
        <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
