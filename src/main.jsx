import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Environment,
  Float,
  Html,
  OrbitControls,
  PerspectiveCamera,
  Sparkles,
  Stars,
  Text,
} from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';
import './styles.css';

function Character({ position, type = 'boy' }) {
  const group = React.useRef();
  const colors = {
    boy: { skin: '#d6a688', top: '#2f4fff', bottom: '#221a1a', hair: '#1f1715' },
    girl: { skin: '#e4b498', top: '#ff4b9b', bottom: '#ffe0f2', hair: '#3f2618' },
    baby: { skin: '#f1bf9f', top: '#ffd54f', bottom: '#79c7ff', hair: '#4a2d20' },
  }[type];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!group.current) return;
    group.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.03;
    group.current.rotation.y = Math.sin(t * 0.8 + position[2]) * 0.1;
  });

  return (
    <group ref={group} position={position}>
      <mesh castShadow position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.28, 48, 48]} />
        <meshPhysicalMaterial color={colors.skin} roughness={0.45} clearcoat={0.3} clearcoatRoughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 1.85, 0.04]}>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial color={colors.hair} metalness={0.1} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0]}>
        <capsuleGeometry args={[0.26, 0.55, 12, 28]} />
        <meshPhysicalMaterial color={colors.top} roughness={0.38} metalness={0.08} sheen={0.9} sheenColor={'#ffffff'} />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.2, 0.45, 8, 18]} />
        <meshStandardMaterial color={colors.bottom} roughness={0.55} />
      </mesh>
      {type === 'baby' && (
        <Text position={[0, 2.15, 0]} fontSize={0.08} color="#ffd7f6" anchorX="center">
          😊
        </Text>
      )}
    </group>
  );
}

function RomanticWorld({ revealProgress }) {
  const cameraRef = React.useRef();
  const rig = React.useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (cameraRef.current) {
      const radius = 5 - revealProgress * 1.5;
      cameraRef.current.position.x = Math.sin(t * 0.18) * radius;
      cameraRef.current.position.z = 6 - revealProgress * 4 + Math.cos(t * 0.2) * 0.7;
      cameraRef.current.position.y = 2.6 - revealProgress * 0.8;
      cameraRef.current.lookAt(0, 1.2, 0);
    }
    if (rig.current) rig.current.rotation.y += 0.0025;
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={50} position={[0, 2.5, 6]} />
      <color attach="background" args={['#090111']} />
      <fog attach="fog" args={['#170427', 5, 22]} />
      <ambientLight intensity={0.45} color="#ffe0f0" />
      <directionalLight castShadow position={[2, 6, 3]} intensity={1.45} color="#ffd0a8" shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <spotLight position={[0, 7, 0]} intensity={1.2} angle={0.55} penumbra={1} color="#f5bbff" />

      <group ref={rig}>
        <mesh receiveShadow rotation-x={-Math.PI / 2}>
          <circleGeometry args={[4.4, 80]} />
          <meshStandardMaterial color="#2b1237" metalness={0.22} roughness={0.4} />
        </mesh>

        <Float speed={1.5} floatIntensity={0.3}>
          <Character position={[-0.8, 0, 0.15]} type="boy" />
          <Character position={[0.8, 0, 0.15]} type="girl" />
          <Character position={[0, 0.06, -0.95]} type="baby" />
        </Float>

        <mesh position={[0, 1.1, 0.2]} rotation={[0.15, 0, 0]}>
          <torusGeometry args={[0.95, 0.035, 20, 80]} />
          <meshStandardMaterial emissive="#ff6dbc" emissiveIntensity={2.5} color="#ffc4e2" />
        </mesh>

        <Text position={[0, 2.7, -0.2]} fontSize={0.27} color="#ffd6f6" anchorX="center" maxWidth={6}>
          Happy Anniversary Thangoo ❤️
        </Text>
        <Text position={[0, 2.25, -0.2]} fontSize={0.14} color="#ffefb3" anchorX="center">
          Forever Together ❤️
        </Text>
      </group>

      <Sparkles count={260} speed={0.35} size={4} scale={[13, 6, 13]} color="#ffccfa" />
      <Stars radius={60} depth={40} count={1200} factor={3} fade speed={0.65} />
      <Environment preset="sunset" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.3} intensity={1.2} mipmapBlur />
        <DepthOfField focusDistance={0.015} focalLength={0.03} bokehScale={2.2} height={480} />
      </EffectComposer>
      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2.05} minPolarAngle={Math.PI / 3.2} />
    </>
  );
}

function App() {
  const [started, setStarted] = React.useState(false);
  const [revealProgress, setRevealProgress] = React.useState(0);
  const overlayRef = React.useRef();

  const startShow = () => {
    setStarted(true);
    gsap.to({ p: 0 }, {
      p: 1,
      duration: 5.5,
      ease: 'power3.inOut',
      onUpdate() {
        setRevealProgress(this.targets()[0].p);
      },
    });
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 1.4, ease: 'power3.out' });
  };

  return (
    <div className="app">
      <audio src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_4f4f5f9f89.mp3?filename=love-story-ambient-piano-11157.mp3" autoPlay={started} loop />
      <Canvas shadows dpr={[1, 2]}>
        <RomanticWorld revealProgress={revealProgress} />
      </Canvas>

      {!started && (
        <div className="overlay" ref={overlayRef}>
          <button className="magic-btn" onClick={startShow}>Click to See the Magic ✨</button>
        </div>
      )}
      {started && <div className="fx-text">💖✨🎆 Floating Hearts • Fireworks • Magic ✨💖</div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
