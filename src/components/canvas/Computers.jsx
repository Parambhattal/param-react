import { Suspense, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import { AnimationMixer } from "three";

import CanvasLoader from "../Loader";

const Computers = ({ isMobile, scrollY }) => {
  const { scene, animations } = useGLTF("./Public/desktop_pc/scene.gltf");
  const [mixer] = useState(() => new AnimationMixer(scene));

  useEffect(() => {
    if (animations && animations.length > 0) {
      const action = mixer.clipAction(animations[0]);
      action.play();

      const targetTime = 1.5;
      const stopTimer = setTimeout(() => {
        action.paused = true;
        action.time = targetTime;
      }, targetTime * 1000);

      return () => {
        clearTimeout(stopTimer);
        action.reset();
        mixer.stopAllAction();
      };
    }
  }, [animations, mixer]);

  useFrame((_, delta) => {
    mixer.update(delta);
  });

  // Scroll-based effect (change position based on scrollY)
  const modelPosition = [-24, -7.6 + scrollY * 0.02, -17.5]; // Adjust the multiplier as needed

  return (
    <mesh>
      <hemisphereLight intensity={5} groundColor="black" />
      <pointLight intensity={4} />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={12}
        intensity={50}
        castShadow
        shadow-mapSize={1024}
      />
      <primitive 
        object={scene} 
        scale={5} 
        position={modelPosition} // Dynamically updated position
        rotation={[0, Math.PI / 3.8, 0]} 
      />
    </mesh>
  );
};

const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0); // Track scroll position

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 500px)');
    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY); // Update scroll position
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Canvas
      frameLoop="demand"
      shadows
      camera={{ position: [20, 0, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Computers isMobile={isMobile} scrollY={scrollY} />
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default ComputersCanvas;
