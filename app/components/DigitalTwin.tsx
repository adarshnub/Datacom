"use client";

import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls, RoundedBox, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ArrowLeft, Box, CircleDot, Layers3, Play, RotateCcw, Server, X } from "lucide-react";
import type { Locale } from "../content";

type Stage = "building" | "room" | "rack" | "port";

const cameraViews: Record<Stage, { position: [number, number, number]; target: [number, number, number] }> = {
  building: { position: [12, 8, 15], target: [0, 1.5, 0] },
  room: { position: [5.4, 2.2, 6.8], target: [2.7, -0.55, 1.4] },
  rack: { position: [3.9, 0.6, 3.8], target: [2.75, -0.72, 1.55] },
  port: { position: [3.5, -0.25, 3.25], target: [2.8, -0.8, 1.92] },
};

function CameraRig({ stage }: { stage: Stage }) {
  const target = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    const view = cameraViews[stage];
    desired.set(...view.position);
    look.set(...view.target);
    const smooth = 1 - Math.exp(-delta * 2.8);
    camera.position.lerp(desired, smooth);
    target.lerp(look, smooth);
    camera.lookAt(target);
  });
  return null;
}

function Hotspot({
  position,
  label,
  onClick,
  visible = true,
}: {
  position: [number, number, number];
  label: string;
  onClick: () => void;
  visible?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 3.2) * 0.12;
      ref.current.scale.setScalar(pulse);
    }
  });

  if (!visible) return null;
  return (
    <group ref={ref} position={position}>
      <mesh
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onClick();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color="#ff4d00" toneMapped={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.19, 0.24, 24]} />
        <meshBasicMaterial color="#ff8a54" transparent opacity={0.72} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <Html center distanceFactor={12} position={[0, 0.42, 0]} style={{ pointerEvents: "none" }}>
        <div className="twin-hotspot-label">{label}</div>
      </Html>
    </group>
  );
}

function Rack({ position, highlighted = false }: { position: [number, number, number]; highlighted?: boolean }) {
  const servers = useMemo(() => Array.from({ length: 9 }, (_, index) => index), []);
  const ports = useMemo(() => Array.from({ length: 8 }, (_, index) => index), []);

  return (
    <group position={position}>
      <RoundedBox args={[0.72, 1.55, 0.82]} radius={0.04} smoothness={2}>
        <meshStandardMaterial color={highlighted ? "#25313b" : "#171e24"} roughness={0.42} metalness={0.72} />
      </RoundedBox>
      {servers.map((server) => (
        <group key={server} position={[0, -0.58 + server * 0.14, 0.425]}>
          <mesh>
            <boxGeometry args={[0.61, 0.09, 0.035]} />
            <meshStandardMaterial color={server === 6 && highlighted ? "#293a43" : "#0a0f13"} metalness={0.4} />
          </mesh>
          {ports.map((port) => (
            <mesh key={port} position={[-0.24 + port * 0.068, 0, 0.023]}>
              <boxGeometry args={[0.025, 0.022, 0.008]} />
              <meshBasicMaterial color={port === 5 && server === 6 && highlighted ? "#ff4d00" : port % 3 === 0 ? "#75edc2" : "#324d4d"} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function GeneratedPortAsset({ visible }: { visible: boolean }) {
  const { scene } = useGLTF("/models/datacom/datacom-fibre-port-24.glb");
  const group = useRef<THREE.Group>(null);
  const reveal = useRef(0);
  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 0.76 / Math.max(size.x, size.y, size.z);
    clone.position.set(-center.x, -center.y, -center.z);
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = false;
        object.receiveShadow = false;
      }
    });
    return { clone, scale };
  }, [scene]);

  useFrame(({ clock }, delta) => {
    reveal.current = THREE.MathUtils.damp(reveal.current, visible ? 1 : 0, 5.5, delta);
    if (!group.current) return;
    const eased = THREE.MathUtils.smoothstep(reveal.current, 0, 1);
    group.current.scale.setScalar(prepared.scale * Math.max(eased, 0.001));
    group.current.rotation.y += delta * 0.24;
    group.current.position.y = -0.8 + Math.sin(clock.elapsedTime * 1.35) * 0.045;
  });

  return (
    <group ref={group} visible={visible} position={[2.8, -0.8, 1.92]} rotation={[0, Math.PI / 2, 0]} scale={0.001}>
      <primitive object={prepared.clone} />
    </group>
  );
}

function SignalFlow({ visible }: { visible: boolean }) {
  const packets = useRef<(THREE.Mesh | null)[]>([]);
  const points = useMemo(() => Array.from({ length: 7 }, () => new THREE.Vector3()), []);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.8, -1.08, -2.15),
        new THREE.Vector3(-1.2, -1.08, -2.15),
        new THREE.Vector3(0, -1.08, -1.2),
        new THREE.Vector3(0.8, -1.08, 1.75),
        new THREE.Vector3(2.9, -1.08, 1.75),
      ]),
    [],
  );

  useFrame(({ clock }) => {
    if (!visible) return;
    packets.current.forEach((packet, index) => {
      if (!packet) return;
      curve.getPointAt((clock.elapsedTime * 0.105 + index / points.length) % 1, points[index]);
      packet.position.copy(points[index]);
      const pulse = 0.78 + Math.sin(clock.elapsedTime * 4 + index) * 0.22;
      packet.scale.setScalar(pulse);
    });
  });

  return (
    <group visible={visible}>
      {points.map((_, index) => (
        <mesh key={index} ref={(node) => { packets.current[index] = node; }}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshBasicMaterial color={index % 2 ? "#29d5c0" : "#ff4d00"} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function XRayScanner({ visible }: { visible: boolean }) {
  const scan = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!scan.current || !material.current || !visible) return;
    const cycle = (clock.elapsedTime * 0.28) % 1;
    scan.current.position.y = -1.55 + cycle * 4.25;
    material.current.opacity = Math.sin(cycle * Math.PI) * 0.2;
  });

  return (
    <mesh ref={scan} visible={visible} position={[0, -1.55, 0]}>
      <boxGeometry args={[8.8, 0.035, 5.65]} />
      <meshBasicMaterial
        ref={material}
        color="#65ffd0"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

function HospitalModel({
  xray,
  stage,
  setStage,
  locale,
}: {
  xray: boolean;
  stage: Stage;
  setStage: (stage: Stage) => void;
  locale: Locale;
}) {
  const root = useRef<THREE.Group>(null);
  const floors = useMemo(() => [-1.4, -0.5, 0.4, 1.3, 2.2], []);
  const windows = useMemo(
    () => Array.from({ length: 36 }, (_, index) => ({ x: -3.9 + (index % 9) * 0.96, y: -1.25 + Math.floor(index / 9) * 0.88 })),
    [],
  );
  const rackPositions: [number, number, number][] = [
    [2.05, -1.2, 1.45],
    [2.9, -1.2, 1.45],
    [2.05, -1.2, 0.48],
    [2.9, -1.2, 0.48],
  ];

  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    if (stage === "building") {
      root.current.rotation.y += delta * 0.075;
      root.current.position.y = Math.sin(clock.elapsedTime * 0.45) * 0.055;
      return;
    }
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.18, 4.5, delta);
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, 0, 4.5, delta);
  });

  const shellOpacity = xray || stage !== "building" ? 0.08 : 0.68;
  const shellVisible = stage !== "port";

  return (
    <group ref={root} rotation={[0, -0.18, 0]}>
      <mesh position={[0, -1.72, 0]}>
        <boxGeometry args={[10.5, 0.18, 7.2]} />
        <meshStandardMaterial color="#10171c" roughness={0.82} />
      </mesh>

      {floors.map((y, index) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[8.7, 0.09, 5.55]} />
          <meshStandardMaterial color={index === 0 ? "#334048" : "#26333a"} roughness={0.75} metalness={0.15} />
        </mesh>
      ))}

      <group visible={shellVisible}>
        <mesh position={[0, 0.4, -2.77]}>
          <boxGeometry args={[8.72, 4.4, 0.08]} />
          <meshStandardMaterial color="#9ca8a9" transparent opacity={shellOpacity} depthWrite={false} roughness={0.75} />
        </mesh>
        <mesh position={[-4.32, 0.4, 0]}>
          <boxGeometry args={[0.08, 4.4, 5.55]} />
          <meshStandardMaterial color="#8c9a9b" transparent opacity={shellOpacity} depthWrite={false} roughness={0.75} />
        </mesh>
        <mesh position={[4.32, 0.4, 0]}>
          <boxGeometry args={[0.08, 4.4, 5.55]} />
          <meshStandardMaterial color="#8c9a9b" transparent opacity={shellOpacity} depthWrite={false} roughness={0.75} />
        </mesh>
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[8.75, 0.08, 5.6]} />
          <meshStandardMaterial color="#728085" transparent opacity={shellOpacity} depthWrite={false} />
        </mesh>
      </group>

      <group visible={!xray && stage === "building"}>
        {windows.map(({ x, y }, index) => (
          <mesh key={`${x}-${y}`} position={[x, y, 2.79]}>
            <boxGeometry args={[0.48, 0.34, 0.035]} />
            <meshBasicMaterial color={index % 4 === 0 ? "#f9b47a" : "#648c92"} transparent opacity={0.78} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 1.42, 2.83]}>
          <boxGeometry args={[0.18, 0.82, 0.07]} />
          <meshBasicMaterial color="#ff4d00" toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.42, 2.83]}>
          <boxGeometry args={[0.82, 0.18, 0.07]} />
          <meshBasicMaterial color="#ff4d00" toneMapped={false} />
        </mesh>
      </group>

      <group visible={xray || stage !== "building"}>
        {floors.slice(0, 4).map((y, floor) => (
          <group key={`path-${y}`}>
            <Line points={[[-3.8, y + 0.28, -2.15], [0, y + 0.28, -2.15], [0, y + 0.28, 1.75], [3.5, y + 0.28, 1.75]]} color={floor % 2 ? "#29d5c0" : "#ff4d00"} lineWidth={1.35} transparent opacity={0.8} />
            <Line points={[[-3.4, y + 0.38, -1.9], [-3.4, y + 0.38, 1.8], [2.7, y + 0.38, 1.8]]} color="#5ab7ff" lineWidth={0.8} transparent opacity={0.58} />
          </group>
        ))}
        <Line points={[[0, -1.18, -2.15], [0, 2.48, -2.15]]} color="#ff4d00" lineWidth={2.1} />
        <Line points={[[-3.4, -1.1, -1.9], [-3.4, 2.45, -1.9]]} color="#29d5c0" lineWidth={1.6} />
      </group>
      <SignalFlow visible={xray || stage !== "building"} />
      <XRayScanner visible={xray && stage === "building"} />

      <group position={[0, 0, 0]}>
        {rackPositions.map((position, index) => (
          <Rack key={position.join("-")} position={position} highlighted={index === 1} />
        ))}
        <mesh position={[2.48, -0.4, 0.98]}>
          <boxGeometry args={[2.15, 0.05, 2.25]} />
          <meshStandardMaterial color="#e4e9e6" transparent opacity={0.22} />
        </mesh>
      </group>
      <GeneratedPortAsset visible={stage === "port"} />

      <Hotspot
        position={[2.9, -0.35, 1.92]}
        label={locale === "en" ? "NETWORK ROOM" : "غرفة الشبكة"}
        onClick={() => setStage("room")}
        visible={stage === "building"}
      />
      <Hotspot
        position={[2.9, -0.35, 1.92]}
        label={locale === "en" ? "RACK D-07" : "الرف D-07"}
        onClick={() => setStage("rack")}
        visible={stage === "room"}
      />
      <Hotspot
        position={[2.82, -0.34, 1.89]}
        label={locale === "en" ? "PORT 24" : "المنفذ 24"}
        onClick={() => setStage("port")}
        visible={stage === "rack"}
      />
    </group>
  );
}

useGLTF.preload("/models/datacom/datacom-fibre-port-24.glb");

const stageCopy: Record<Stage, { en: string; ar: string; meta: string }> = {
  building: { en: "Hospital Campus", ar: "مجمع المستشفى", meta: "SITE / 01" },
  room: { en: "Network Room", ar: "غرفة الشبكة", meta: "LEVEL B1 / 02" },
  rack: { en: "Rack D-07", ar: "الرف D-07", meta: "ROW D / 03" },
  port: { en: "Fibre Port 24", ar: "منفذ الألياف 24", meta: "OM5 / 800G / 04" },
};

export default function DigitalTwin({ locale }: { locale: Locale }) {
  const [stage, setStage] = useState<Stage>("building");
  const [xray, setXray] = useState(false);
  const [touring, setTouring] = useState(() => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const stages: Stage[] = ["building", "room", "rack", "port"];
  const currentIndex = stages.indexOf(stage);
  const activeXray = xray || stage !== "building";

  const reset = () => {
    setTouring(false);
    setStage("building");
    setXray(false);
  };

  const startTour = () => {
    setStage("building");
    setXray(false);
    setTouring(false);
    window.requestAnimationFrame(() => setTouring(true));
  };

  const selectStage = (nextStage: Stage) => {
    setTouring(false);
    setStage(nextStage);
    if (nextStage === "building") setXray(false);
  };

  useEffect(() => {
    if (!touring) return;

    const timers = [
      window.setTimeout(() => setXray(true), 1100),
      window.setTimeout(() => setStage("room"), 2900),
      window.setTimeout(() => setStage("rack"), 4800),
      window.setTimeout(() => setStage("port"), 6600),
      window.setTimeout(() => setTouring(false), 9000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [touring]);

  return (
    <div className="twin-shell" aria-label={locale === "en" ? "Interactive hospital infrastructure digital twin" : "توأم رقمي تفاعلي لبنية المستشفى"}>
      <Canvas
        className="twin-canvas"
        dpr={[1, 1.75]}
        camera={{ fov: 34, near: 0.1, far: 100, position: cameraViews.building.position }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#071015"]} />
        <fog attach="fog" args={["#071015", 17, 36]} />
        <ambientLight intensity={0.82} />
        <directionalLight position={[7, 12, 8]} intensity={2.2} color="#e9f8ff" />
        <pointLight position={[-5, 1, 5]} intensity={26} distance={12} color="#ff6422" />
        <Suspense fallback={null}>
          <HospitalModel xray={activeXray} stage={stage} setStage={selectStage} locale={locale} />
        </Suspense>
        <CameraRig stage={stage} />
        <OrbitControls enabled={stage === "building" && !touring} enablePan={false} minDistance={8} maxDistance={22} minPolarAngle={0.65} maxPolarAngle={1.32} dampingFactor={0.06} enableDamping />
      </Canvas>

      <div className="twin-grid" aria-hidden="true" />
      <div className="twin-topbar">
        <span><i /> {touring ? (locale === "en" ? "GUIDED 3D TOUR RUNNING" : "جولة ثلاثية الأبعاد قيد التشغيل") : (locale === "en" ? "LIVE DIGITAL TWIN" : "توأم رقمي مباشر")}</span>
        <span>DC-XR / 0024</span>
      </div>

      <div className="twin-rail" aria-label={locale === "en" ? "Digital twin depth" : "مستوى التوأم الرقمي"}>
        {stages.map((item, index) => (
          <button key={item} className={index <= currentIndex ? "active" : ""} onClick={() => selectStage(item)} aria-label={stageCopy[item][locale]} title={stageCopy[item][locale]}>
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>

      <div className="twin-controls">
        {stage !== "building" && (
          <button className="icon-control" onClick={() => selectStage(stages[currentIndex - 1])} aria-label={locale === "en" ? "Go back one level" : "العودة مستوى واحد"}>
            <ArrowLeft size={16} />
          </button>
        )}
        <button className={`tour-control ${touring ? "active" : ""}`} onClick={startTour}>
          {touring ? <RotateCcw size={15} /> : <Play size={15} />}
          <span>{locale === "en" ? (touring ? "RESTART TOUR" : "PLAY 3D TOUR") : touring ? "إعادة الجولة" : "تشغيل الجولة"}</span>
        </button>
        <button className={`xray-control ${activeXray ? "active" : ""}`} onClick={() => { setTouring(false); setXray((value) => !value); }} disabled={stage !== "building"}>
          <Layers3 size={16} />
          <span>{locale === "en" ? (activeXray ? "X-RAY ON" : "ACTIVATE X-RAY") : activeXray ? "الأشعة مفعلة" : "تفعيل الأشعة"}</span>
        </button>
        <button className="icon-control" onClick={reset} aria-label={locale === "en" ? "Reset digital twin" : "إعادة ضبط التوأم الرقمي"}>
          {stage === "building" ? <RotateCcw size={16} /> : <X size={16} />}
        </button>
      </div>

      <div className="twin-readout">
        <span className="eyebrow">{stageCopy[stage].meta}</span>
        <strong>{stageCopy[stage][locale]}</strong>
        <p>
          {stage === "building" && (locale === "en" ? "Select the signal point or activate x-ray." : "اختر نقطة الإشارة أو فعّل الأشعة.")}
          {stage === "room" && (locale === "en" ? "Four high-density racks · dual fibre pathway." : "أربعة رفوف عالية الكثافة · مسار ألياف مزدوج.")}
          {stage === "rack" && (locale === "en" ? "42U · intelligent power · monitored access." : "42U · طاقة ذكية · وصول مراقب.")}
          {stage === "port" && (locale === "en" ? "MPO-12 · OM5 · polarity B · link verified." : "MPO-12 · OM5 · قطبية B · رابط موثّق.")}
        </p>
        {stage === "port" && <span className="twin-asset-badge"><i /> {locale === "en" ? "MESHY 3D ASSET · GLB / PBR" : "أصل ثلاثي الأبعاد · GLB / PBR"}</span>}
        <div className="readout-icon" aria-hidden="true">
          {stage === "building" ? <Box /> : stage === "room" ? <Server /> : <CircleDot />}
        </div>
      </div>
    </div>
  );
}
