import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createSculpture, createExhibit } from "./sculptures";
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
  const hero = createSculpture(defaultSettings.color);
  scene.add(hero);
  const exhibits = artworkKinds.map((kind) => {
    const group = createExhibit(kind, defaultSettings.color);
    group.userData.kind = kind;
    scene.add(group);
    return group;
  });
  const floorMaterial = new THREE.MeshBasicMaterial({
    color: "#8b8b89",
    transparent: true,
    opacity: 0.065,
  });
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.5, 64),
    floorMaterial,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.9;
  scene.add(floor);
  // Small satellites echo the material of the main sculpture without loading models.
  const orbit = new THREE.Group();
  const satelliteGeometry = new THREE.IcosahedronGeometry(0.045, 0);
  const satelliteMaterial = new THREE.MeshStandardMaterial({
    color: "#acb6cb",
    metalness: 1,
    roughness: 0.23,
  });
  for (let i = 0; i < 24; i++) {
    const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
    const a = i * 2.39996;
    satellite.position.set(
      Math.cos(a) * (2.5 + (i % 3) * 0.25),
      (i / 23 - 0.5) * 4.8,
      Math.sin(a) * 1.5,
    );
    orbit.add(satellite);
  }
  scene.add(orbit);
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
  const resize = () => {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        settings.quality === "high" ? 2 : settings.quality === "eco" ? 1 : 1.5,
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
    orbit.visible = hero.visible;
    floor.visible = hero.visible;
    if (hero.visible) {
      const scale = mobile ? (wide ? 0.75 : 0.66) : 1.1;
      hero.scale.setScalar(scale * (1 - reveal));
      hero.position.set(mobile ? 0.05 : 2.05, mobile ? -0.62 : 0.05, 0);
      hero.rotation.set(
        0.04 + drift.y * 0.05,
        -0.38 + Math.sin(clock * 0.14) * 0.12 + drift.x * 0.13,
        -0.08,
      );
      const directions = hero.userData.layerDirections as THREE.Vector3[];
      hero.children.forEach((layer, index) =>
        layer.position.copy(directions[index]).multiplyScalar(explode * 1.25),
      );
      orbit.position.copy(hero.position);
      orbit.scale.copy(hero.scale);
      orbit.rotation.y = clock * 0.03;
      floor.position.x = hero.position.x;
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
      const galleryScale = mobile && !wide ? 0.74 : 1.05;
      const targetScale = mobile
        ? options.mode === "story"
          ? 1.05
          : 1.3
        : 1.85;
      group.position.set(
        THREE.MathUtils.lerp(
          galleryX,
          mobile ? (options.mode === "story" ? 0.65 : 0) : -0.05,
          focus,
        ),
        THREE.MathUtils.lerp(
          galleryY,
          mobile ? (options.mode === "experiment" ? -1.2 : 0.2) : 0,
          focus,
        ),
        0,
      );
      group.scale.setScalar(
        reveal *
          (selected
            ? THREE.MathUtils.lerp(galleryScale, targetScale, focus)
            : galleryScale * (1 - focus)),
      );
      group.rotation.z = drift.x * 0.04;
      group.userData.animate(clock);
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
      if (kind === "particles") {
        // GPU positions aren't DOM elements or CPU vertices. Use the field's
        // volume for learning-mode picking rather than the seed geometry.
        const sphere = particleBounds.clone().applyMatrix4(group.matrixWorld);
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
            : "首页 3D 雕塑",
          name: kind ? "createExhibit('" + kind + "')" : "createSculpture()",
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
      source: "src/scene/sculptures.ts / src/scene/createArtScene.ts",
      note: "形状、材质和粒子改 sculptures.ts；大小、位置、摄像机和滚动解构改 createArtScene.ts。蓝框是对象的投影范围。",
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
      const blue = hero.getObjectByName("blue-ribbon") as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.MeshPhysicalMaterial
      >;
      blue.material.color.set(next.color);
      exhibits.forEach((group) =>
        group.userData.setParameters({ ...next, reducedMotion: reduce }),
      );
      if (qualityChanged) resize();
      dirty = true;
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frame);
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
