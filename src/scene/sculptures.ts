import * as THREE from "three";

type ExhibitKind = "particles" | "liquid" | "light";
type ExhibitParameters = {
  density: number;
  speed: number;
  color: string;
  paused: boolean;
  reducedMotion: boolean;
};

const clamp = THREE.MathUtils.clamp;

function metal(
  color: THREE.ColorRepresentation,
  roughness = 0.2,
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.96,
    roughness,
    clearcoat: 1,
    clearcoatRoughness: 0.11,
    envMapIntensity: 1.65,
  });
}

/** Deformed metal surface and orbiting droplets; this is not a fluid solver. */
function makeLiquid(color: string) {
  const group = new THREE.Group();
  const material = metal(color, 0.14);
  const geometry = new THREE.SphereGeometry(0.78, 80, 56);
  const position = geometry.getAttribute("position");
  const vertex = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const angle = Math.atan2(vertex.z, vertex.x);
    const height = vertex.y / 0.78;
    const equator = Math.sqrt(Math.max(0, 1 - height * height));
    const folded =
      1 +
      equator *
        (0.18 * Math.sin(angle * 3 + height * 5) +
          0.095 * Math.sin(angle * 6 - height * 4));
    vertex.x *= folded;
    vertex.z *= folded;
    vertex.y *= 1.19;
    vertex.x += 0.14 * Math.sin(height * 3.8) * equator;
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const blob = new THREE.Mesh(geometry, material);
  blob.name = "liquid-core";
  blob.castShadow = true;
  blob.receiveShadow = true;
  group.add(blob);
  const droplets: THREE.Mesh[] = [];
  const dropletGeometry = new THREE.SphereGeometry(1, 24, 16);
  for (let i = 0; i < 7; i++) {
    const droplet = new THREE.Mesh(dropletGeometry, material);
    const size = 0.065 + (i % 3) * 0.027;
    droplet.scale.set(size, size * 1.3, size);
    droplet.name = `liquid-droplet-${i}`;
    droplets.push(droplet);
    group.add(droplet);
  }
  return {
    group,
    update: (phase: number) => {
      blob.rotation.y = phase * 0.15;
      blob.rotation.z = Math.sin(phase * 0.4) * 0.085;
      blob.scale.set(
        1 + Math.sin(phase * 0.8) * 0.025,
        1,
        1 - Math.sin(phase * 0.8) * 0.025,
      );
      droplets.forEach((droplet, i) => {
        const a = i * 2.39996 + phase * 0.19;
        const radius = 0.93 + 0.06 * Math.sin(phase * 0.6 + i);
        droplet.position.set(
          Math.cos(a) * radius,
          (i / 6 - 0.5) * 1.74,
          Math.sin(a) * radius,
        );
      });
    },
    configure: (params: ExhibitParameters) => {
      material.color.set(params.color);
      droplets.forEach((droplet, i) => {
        droplet.visible = i < Math.ceil(params.density * droplets.length);
      });
    },
  };
}

function makeLight(color: string) {
  const group = new THREE.Group();
  const sheets: THREE.Mesh[] = [];
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uDensity: { value: 0.75 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uDensity;
      varying vec2 vUv;
      void main() {
        float edge = pow(abs(vUv.y - 0.5) * 2.0, 10.0);
        float rib = pow(0.5 + 0.5 * sin(vUv.x * 150.0 - uTime * 1.4), 18.0);
        float endFade = smoothstep(0.0, 0.1, vUv.x) * (1.0 - smoothstep(0.9, 1.0, vUv.x));
        float strength = (0.07 + edge * 0.72 + rib * 0.18) * endFade;
        vec3 color = mix(uColor, vec3(0.88, 0.95, 1.0), edge * 0.7);
        gl_FragColor = vec4(color * (1.2 + edge * 1.5), strength * (0.55 + uDensity * 0.45));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  for (let layer = 0; layer < 4; layer++) {
    const geometry = new THREE.PlaneGeometry(1, 1, 100, 12);
    const positions = geometry.getAttribute("position");
    const uv = geometry.getAttribute("uv");
    for (let i = 0; i < positions.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i) * 2 - 1;
      const a = u * Math.PI * 1.6 + (layer * Math.PI) / 2;
      const radius = 0.35 + 0.27 * Math.sin(Math.PI * u) + v * 0.14;
      positions.setXYZ(
        i,
        Math.cos(a) * radius,
        (u - 0.5) * 2.1,
        Math.sin(a) * radius,
      );
    }
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    const sheet = new THREE.Mesh(geometry, material);
    sheet.name = `light-sail-${layer}`;
    sheets.push(sheet);
    group.add(sheet);
  }
  const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.12,
    metalness: 0.18,
    emissive: color,
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
  });
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.31, 0),
    crystalMaterial,
  );
  crystal.scale.y = 1.9;
  crystal.name = "light-heart";
  group.add(crystal);
  return {
    group,
    update: (phase: number) => {
      material.uniforms.uTime.value = phase;
      group.rotation.y = phase * 0.085;
      crystal.rotation.y = -phase * 0.25;
      crystalMaterial.emissiveIntensity = 0.55 + Math.sin(phase * 1.15) * 0.12;
    },
    configure: (params: ExhibitParameters) => {
      material.uniforms.uColor.value.set(params.color);
      material.uniforms.uDensity.value = params.density;
      crystalMaterial.color.set(params.color);
      crystalMaterial.emissive.set(params.color);
      sheets.forEach((sheet, i) => {
        sheet.visible =
          i < Math.max(1, Math.ceil(params.density * sheets.length));
      });
    },
  };
}

/** No renderer or event lifecycle is owned here; callers drive time and dispose meshes. */
export function createExhibit(
  kind: Exclude<ExhibitKind, "particles">,
  color: string,
): THREE.Group {
  const exhibit = kind === "liquid" ? makeLiquid(color) : makeLight(color);
  const { group } = exhibit;
  group.name = `${kind}-exhibit`;
  let parameters: ExhibitParameters = {
    density: 0.75,
    speed: 1,
    color,
    paused: false,
    reducedMotion: false,
  };
  let previousSeconds: number | undefined;
  let phase = 0;

  group.userData.setParameters = (next: ExhibitParameters) => {
    parameters = {
      density: clamp(next.density, 0.15, 1),
      speed: clamp(next.speed, 0.2, 2),
      color: /^#[\da-f]{6}$/i.test(next.color) ? next.color : parameters.color,
      paused: next.paused,
      reducedMotion: next.reducedMotion,
    };
    exhibit.configure(parameters);
  };
  group.userData.animate = (seconds: number) => {
    const delta =
      previousSeconds === undefined
        ? 0
        : clamp(seconds - previousSeconds, 0, 0.25);
    previousSeconds = seconds;
    if (!parameters.paused && !parameters.reducedMotion)
      phase += delta * parameters.speed;
    exhibit.update(phase);
  };
  exhibit.configure(parameters);
  exhibit.update(0);
  return group;
}
