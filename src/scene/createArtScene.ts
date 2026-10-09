import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createExhibit } from "./sculptures";
import { createParticleField } from "./particleField";
import type { SceneInspection } from "../learning/sceneRegistry";
import { artworks } from "../data/artworks";
import { artworkKinds, type ArtworkKind } from "../data/artworks";
import { defaultSettings, type LabSettings } from "../state/model";

export type SceneMode = "story" | "gallery" | "experiment";
export interface SceneOptions {
  mode: SceneMode;
  kind: ArtworkKind;
  onLost: () => void;
}
export interface ArtScene {
  inspect: (x: number, y: number) => SceneInspection | null;
  setProgress: (progress: number) => void;
  setKind: (kind: ArtworkKind) => void;
  configure: (settings: LabSettings, reducedMotion: boolean) => void;
  setAvailable: (kinds: ArtworkKind[]) => void;
  dispose: () => void;
}

export function createArtScene(
  container: HTMLElement,
  options: SceneOptions,
): ArtScene {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight("#dbe6ff", "#68718b", 3));
  const key = new THREE.DirectionalLight("#ffffff", 5);
  key.position.set(3, 5, 4);
  scene.add(key);
  const edge = new THREE.DirectionalLight("#92aaff", 4);
  edge.position.set(-4, 1, -2);
  scene.add(edge);
  const fieldSize = container.clientWidth < 760 ? 64 : 128;
  const heroField =
    options.mode === "story"
      ? createParticleField(renderer, defaultSettings.color, fieldSize)
      : null;
  const exhibitField = createParticleField(
    renderer,
    defaultSettings.color,
    fieldSize,
  );
  const hero = heroField?.group ?? new THREE.Group();
  scene.add(hero);
  const exhibits = artworkKinds.map((kind) => {
    const group =
      kind === "particles"
        ? exhibitField.group
        : createExhibit(kind, defaultSettings.color);
    group.userData.kind = kind;
    scene.add(group);
    return group;
  });
  let settings = { ...defaultSettings };
  let reducedMotion = false;
  let progress = 0;
  let selectedKind = options.kind;
  let available = [...artworkKinds] as ArtworkKind[];
  let width = 1;
  let height = 1;
  let frame = 0;
  let disposed = false;
  let lost = false;
  let dirty = true;
  let lastDraw = 0;
  let clock = 0;
  let previousTime = 0;
  const pointer = new THREE.Vector2();
  const drift = new THREE.Vector2();
  const aim = new THREE.Vector3();
  let pointerActive = false;
  let simulationTime = 0;
  let adaptiveScale = 1;
  let slowFrames = 0;
  const forceRay = new THREE.Raycaster();
  const forcePlane = new THREE.Plane();
  const forceNormal = new THREE.Vector3();
  const forceWorld = new THREE.Vector3();
  const localPointer = new THREE.Vector3();
  container.dataset.simulation = exhibitField.backend;
  container.dataset.particles = String(exhibitField.count);
  const resize = () => {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      adaptiveScale *
        Math.min(
          window.devicePixelRatio || 1,
          settings.quality === "high"
            ? 2
            : settings.quality === "eco"
              ? 1
              : 1.5,
        ),
    );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const pointerMove = (event: PointerEvent) => {
    const bounds = container.getBoundingClientRect();
    pointerActive =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;
    pointer.set(
      THREE.MathUtils.clamp(
        ((event.clientX - bounds.left) / width) * 2 - 1,
        -1,
        1,
      ),
      THREE.MathUtils.clamp(
        -(((event.clientY - bounds.top) / height) * 2 - 1),
        -1,
        1,
      ),
    );
    dirty = true;
  };
  const pointerLeave = () => {
    pointerActive = false;
    pointer.set(0, 0);
    dirty = true;
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    options.onLost();
  };
  window.addEventListener("pointermove", pointerMove, { passive: true });
  document.addEventListener("pointerleave", pointerLeave);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  resize();

  const layout = () => {
    const mobile = width < 760;
    const aspect = width / height;
    const wide = aspect > 1.1;
    camera.position.set(0, 0.3, mobile ? 12.5 : 11.5);
    aim.set(0, 0, 0);
    const reveal =
      options.mode === "story"
        ? THREE.MathUtils.smoothstep(progress, 1.35, 1.95)
        : 1;
    const focus =
      options.mode === "story"
        ? THREE.MathUtils.smoothstep(progress, 2.35, 2.95)
        : options.mode === "experiment"
          ? 1
          : 0;
    const explode =
      options.mode === "story"
        ? THREE.MathUtils.smoothstep(progress, 0.55, 1.35)
        : 0;
    hero.visible = options.mode === "story" && reveal < 0.999;
    if (hero.visible) {
      const scale = mobile ? (wide ? 1.15 : 1.08) : 1.95;
      hero.scale.setScalar(scale * (1 - reveal * 0.2));
      heroField?.setOpacity(1 - reveal);
      hero.position.set(mobile ? 0.05 : 2.0, mobile ? -0.92 : 0.03, 0);
      hero.rotation.set(
        0.04 + drift.y * 0.05,
        -0.38 + Math.sin(clock * 0.14) * 0.12 + drift.x * 0.13,
        -0.08,
      );
      if (progress > 0.6) camera.position.z -= explode * 0.5;
    }
    exhibits.forEach((group, index) => {
      const kind = artworkKinds[index];
      const selected = kind === selectedKind;
      group.visible =
        reveal > 0.001 && (focus < 0.999 ? available.includes(kind) : selected);
      const galleryX =
        mobile && !wide
          ? options.mode === "gallery"
            ? -0.6
            : 0.8
          : (index - 1) * 3.4;
      const galleryY =
        mobile && !wide
          ? options.mode === "gallery"
            ? 0.85 - index * 1.85
            : 2.05 - index * 2.1
          : -0.05;
      const galleryScale = mobile && !wide ? 0.54 : 0.8;
      const targetScale = mobile
        ? options.mode === "story"
          ? 0.93
          : 1.3
        : 1.85;
      group.position.set(
        THREE.MathUtils.lerp(
          galleryX,
          mobile ? (options.mode === "story" ? 0.35 : 0) : -0.05,
          focus,
        ),
        THREE.MathUtils.lerp(
          galleryY,
          mobile ? (options.mode === "experiment" ? -1.2 : 0.2) : 0,
          focus,
        ),
        -0.5,
      );
      group.scale.setScalar(
        reveal *
          (selected
            ? THREE.MathUtils.lerp(galleryScale, targetScale, focus)
            : galleryScale * (1 - focus)),
      );
      group.rotation.z = drift.x * 0.04;
      if (kind !== "particles") group.userData.animate(clock);
    });
    camera.position.x += drift.x * 0.18;
    camera.position.y += drift.y * 0.13;
    camera.lookAt(aim);
  };
  const tick = (now: number) => {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    const elapsed = previousTime
      ? Math.min((now - previousTime) / 1000, 0.1)
      : 0;
    previousTime = now;
    if (document.hidden || lost) return;
    if (!settings.paused && !reducedMotion) clock += elapsed;
    drift.lerp(reducedMotion ? new THREE.Vector2() : pointer, 0.045);
    const active = !settings.paused && !reducedMotion;
    const moving = !reducedMotion && drift.distanceTo(pointer) > 0.001;
    const interval = settings.quality === "eco" ? 1000 / 30 : 1000 / 60;
    if (now - lastDraw < interval || (!active && !moving && !dirty)) return;
    layout();
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    const simElapsed = simulationTime
      ? Math.min((now - simulationTime) / 1000, 0.05)
      : 1 / 60;
    simulationTime = now;
    camera.getWorldDirection(forceNormal);
    forceRay.setFromCamera(pointer, camera);
    for (const field of [heroField, exhibitField]) {
      if (!field) continue;
      if (!field.group.visible) continue;
      forcePlane.setFromNormalAndCoplanarPoint(
        forceNormal,
        field.group.position,
      );
      const hit =
        pointerActive && !document.querySelector('[aria-modal="true"]')
          ? forceRay.ray.intersectPlane(forcePlane, forceWorld)
          : null;
      const target = hit
        ? field.group.worldToLocal(localPointer.copy(hit))
        : null;
      const morph =
        field === heroField
          ? THREE.MathUtils.smoothstep(progress, 0.15, 1.3) * 2
          : settings.formation === "sphere"
            ? 0
            : settings.formation === "helix"
              ? 1
              : 2;
      field.advance(simElapsed, morph, target);
    }
    // Auto quality reduces raster cost after sustained slow frames, with a floor.
    // It never changes the solver's timestep or user's saved density setting.
    if (
      settings.quality === "auto" &&
      active &&
      elapsed > 0.028 &&
      elapsed < 0.09
    )
      slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 90 && adaptiveScale > 0.6) {
      adaptiveScale = Math.max(0.6, adaptiveScale - 0.15);
      slowFrames = 0;
      resize();
    }
    renderer.render(scene, camera);
    lastDraw = now;
    dirty = false;
  };
  frame = requestAnimationFrame(tick);
  const inspectionRay = new THREE.Raycaster();
  const projected = new THREE.Vector3();
  const particleBounds = new THREE.Sphere(new THREE.Vector3(), 1.35);
  const inspect = (x: number, y: number): SceneInspection | null => {
    if (disposed || lost) return null;
    const view = container.getBoundingClientRect();
    inspectionRay.setFromCamera(
      new THREE.Vector2(
        ((x - view.left) / width) * 2 - 1,
        -(((y - view.top) / height) * 2 - 1),
      ),
      camera,
    );
    let picked: {
      group: THREE.Group;
      box: THREE.Box3;
      distance: number;
      title: string;
      name: string;
    } | null = null;
    for (const group of [hero, ...exhibits]) {
      if (!group.visible || group.scale.x < 0.01) continue;
      const kind = group.userData.kind as ArtworkKind | undefined;
      let box: THREE.Box3;
      let distance: number;
      if (group.userData.particleField) {
        // GPU positions aren't DOM elements or CPU vertices. Use the field's
        // volume for learning-mode picking rather than the seed geometry.
        const sphere = particleBounds.clone();
        sphere.radius = group.userData.inspectionRadius;
        sphere.applyMatrix4(group.matrixWorld);
        const hit = inspectionRay.ray.intersectSphere(
          sphere,
          new THREE.Vector3(),
        );
        if (!hit) continue;
        box = sphere.getBoundingBox(new THREE.Box3());
        distance = inspectionRay.ray.origin.distanceTo(hit);
      } else {
        const hit = inspectionRay.intersectObject(group, true)[0];
        if (!hit) continue;
        box = new THREE.Box3().setFromObject(group);
        distance = hit.distance;
      }
      if (!picked || distance < picked.distance)
        picked = {
          group,
          box,
          distance,
          title: kind
            ? "3D 展品 · " + artworks.find((art) => art.kind === kind)!.title
            : "首页交互粒子场",
          name: group.userData.particleField
            ? "createParticleField()"
            : "createExhibit('" + kind + "')",
        };
    }
    if (!picked) return null;
    const bounds = {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity,
    };
    for (const px of [picked.box.min.x, picked.box.max.x])
      for (const py of [picked.box.min.y, picked.box.max.y])
        for (const pz of [picked.box.min.z, picked.box.max.z]) {
          projected.set(px, py, pz).project(camera);
          const sx = view.left + ((projected.x + 1) / 2) * width;
          const sy = view.top + ((1 - projected.y) / 2) * height;
          bounds.left = Math.min(bounds.left, sx);
          bounds.top = Math.min(bounds.top, sy);
          bounds.right = Math.max(bounds.right, sx);
          bounds.bottom = Math.max(bounds.bottom, sy);
        }
    return {
      title: picked.title,
      selector: "Three.js 对象 / " + picked.name,
      source: picked.group.userData.particleField
        ? "src/scene/particleField.ts / src/scene/createArtScene.ts"
        : "src/scene/sculptures.ts / src/scene/createArtScene.ts",
      note: picked.group.userData.particleField
        ? "粒子形态、速度积分和鼠标力场改 particleField.ts；构图和滚动进度改 createArtScene.ts。蓝框为近似体积。"
        : "形状和材质改 sculptures.ts；构图、摄像机改 createArtScene.ts。",
      rect: {
        left: bounds.left,
        top: bounds.top,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top,
      },
    };
  };
  return {
    inspect,
    setProgress: (next) => {
      progress = THREE.MathUtils.clamp(next, 0, 3);
      dirty = true;
    },
    setKind: (kind) => {
      selectedKind = kind;
      dirty = true;
    },
    setAvailable: (kinds) => {
      available = kinds;
      dirty = true;
    },
    configure: (next, reduce) => {
      const qualityChanged = settings.quality !== next.quality;
      settings = next;
      reducedMotion = reduce;
      heroField?.configure(next, reduce);
      exhibitField.configure(next, reduce);
      exhibits.forEach((group) =>
        group.userData.setParameters?.({ ...next, reducedMotion: reduce }),
      );
      if (qualityChanged) {
        adaptiveScale = 1;
        slowFrames = 0;
        resize();
      }
      dirty = true;
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frame);
      heroField?.dispose();
      exhibitField.dispose();
      observer.disconnect();
      window.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointerleave", pointerLeave);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) geometries.add(mesh.geometry);
        if (mesh.material)
          (Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]
          ).forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
