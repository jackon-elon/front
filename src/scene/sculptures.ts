import * as THREE from "three";

type ExhibitKind = "particles" | "liquid" | "light";
type ExhibitParameters = {
  density: number;
  speed: number;
  color: string;
  paused: boolean;
  reducedMotion: boolean;
};

type SweepOptions = {
  points: number[][];
  width: number;
  thickness: number;
  twist: number;
  phase?: number;
  segments?: number;
};

const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;

/** A capped, elliptical ribbon swept around a curved spine. */
function ribbonGeometry(options: SweepOptions): THREE.BufferGeometry {
  const { width, thickness, twist, phase = 0, segments = 180 } = options;
  const sides = 20;
  const curve = new THREE.CatmullRomCurve3(
    options.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal",
  );
  const frames = curve.computeFrenetFrames(segments, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const position = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const center = curve.getPointAt(u);
    const angle = phase + twist * u + 0.55 * Math.sin(TAU * u);
    normal
      .copy(frames.normals[i])
      .multiplyScalar(Math.cos(angle))
      .addScaledVector(frames.binormals[i], Math.sin(angle));
    binormal
      .copy(frames.binormals[i])
      .multiplyScalar(Math.cos(angle))
      .addScaledVector(frames.normals[i], -Math.sin(angle));
    // Narrow tips and changing width give the folds a poured-metal silhouette.
    const taper = 0.055 + 0.945 * Math.pow(Math.sin(Math.PI * u), 0.38);
    const broadness =
      width * taper * (0.84 + 0.2 * Math.sin(3 * Math.PI * u + phase));
    const depth = thickness * taper * (0.9 + 0.24 * Math.sin(TAU * u + 0.6));
    for (let j = 0; j <= sides; j++) {
      const v = j / sides;
      const a = v * TAU;
      const fold = 1 + 0.065 * Math.sin(u * 5 * Math.PI + a * 3);
      position
        .copy(center)
        .addScaledVector(normal, Math.cos(a) * broadness * fold)
        .addScaledVector(binormal, Math.sin(a) * depth);
      positions.push(position.x, position.y, position.z);
      uvs.push(u, v);
      if (i < segments && j < sides) {
        const a0 = i * (sides + 1) + j;
        const b = a0 + sides + 1;
        indices.push(a0, a0 + 1, b, b, a0 + 1, b + 1);
      }
    }
  }

  for (const end of [0, segments]) {
    const center = curve.getPointAt(end / segments);
    const index = positions.length / 3;
    positions.push(center.x, center.y, center.z);
    uvs.push(end / segments, 0.5);
    const offset = end * (sides + 1);
    for (let j = 0; j < sides; j++) {
      if (end === 0) indices.push(index, offset + j + 1, offset + j);
      else indices.push(index, offset + j, offset + j + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/** Merge compatible surfaces without retaining disposable helper geometries. */
function mergeSurfaces(
  geometries: THREE.BufferGeometry[],
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let offset = 0;
  for (const geometry of geometries) {
    const p = geometry.getAttribute("position");
    const n = geometry.getAttribute("normal");
    const uv = geometry.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      positions.push(p.getX(i), p.getY(i), p.getZ(i));
      normals.push(n.getX(i), n.getY(i), n.getZ(i));
      uvs.push(uv.getX(i), uv.getY(i));
    }
    const index = geometry.getIndex();
    if (index)
      for (let i = 0; i < index.count; i++)
        indices.push(index.getX(i) + offset);
    offset += p.count;
    geometry.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  merged.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  merged.setIndex(indices);
  merged.computeBoundingSphere();
  return merged;
}

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

/** Three independent layers; all geometry is local and centered around the origin. */
export function createSculpture(color: string): THREE.Group {
  const group = new THREE.Group();
  group.name = "folded-flow-sculpture";

  const blueGeometry = mergeSurfaces([
    ribbonGeometry({
      points: [
        [-0.75, -2.05, 0.32],
        [-1.16, -1.62, 0.52],
        [-0.67, -1.02, 0.65],
        [0.55, -0.6, 0.15],
        [0.93, 0.02, -0.03],
        [0.23, 0.62, -0.3],
        [-0.63, 1.09, 0.06],
        [-0.72, 1.76, 0.46],
        [-0.09, 2.09, 0.16],
        [0.64, 1.84, -0.3],
        [0.27, 1.31, -0.48],
      ],
      width: 0.78,
      thickness: 0.12,
      twist: Math.PI * 2.2,
      phase: 0.4,
    }),
    ribbonGeometry({
      points: [
        [-0.72, -1.9, 0.37],
        [-0.04, -1.75, -0.35],
        [0.64, -1.12, -0.68],
        [0.5, -0.39, -0.74],
        [-0.27, 0.02, -0.35],
        [-0.9, -0.17, 0.06],
      ],
      width: 0.49,
      thickness: 0.095,
      twist: -Math.PI * 1.65,
      phase: 1.5,
      segments: 120,
    }),
  ]);
  const silverGeometry = mergeSurfaces([
    ribbonGeometry({
      points: [
        [-1.21, -2.35, 0.18],
        [-0.35, -1.7, 0.85],
        [0.86, -0.83, 0.7],
        [1.16, 0.11, 0.47],
        [0.69, 1.16, 0.25],
        [0.4, 2.42, 0.06],
      ],
      width: 0.58,
      thickness: 0.062,
      twist: -Math.PI * 1.55,
      phase: 0.8,
    }),
    ribbonGeometry({
      points: [
        [-1.56, 1.79, -0.14],
        [-1.18, 0.95, -0.46],
        [-0.65, 0.42, -0.73],
        [0.28, 0.22, -0.47],
        [0.91, 0.68, -0.05],
        [0.73, 1.28, 0.25],
      ],
      width: 0.38,
      thickness: 0.045,
      twist: Math.PI * 1.4,
      phase: 1.8,
      segments: 140,
    }),
  ]);
  const glassGeometry = mergeSurfaces([
    ribbonGeometry({
      points: [
        [-1.57, -2.03, 0.56],
        [-1.79, -1.06, 0.03],
        [-1.28, -0.03, -0.75],
        [-0.11, 0.61, -0.91],
        [0.69, 1.23, -0.69],
        [1.54, 2.08, -0.13],
      ],
      width: 0.35,
      thickness: 0.027,
      twist: Math.PI * 1.6,
      phase: 0.1,
    }),
    ribbonGeometry({
      points: [
        [-1.68, 1.91, 0.06],
        [-0.99, 1.42, 0.9],
        [-0.02, 0.55, 1.05],
        [0.79, -0.14, 0.73],
        [1.4, -0.34, 0.33],
      ],
      width: 0.24,
      thickness: 0.022,
      twist: -Math.PI * 1.1,
      phase: 0.9,
      segments: 130,
    }),
  ]);
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#dce8ff",
    metalness: 0.03,
    roughness: 0.08,
    transmission: 0.88,
    thickness: 0.13,
    ior: 1.46,
    transparent: true,
    opacity: 0.82,
    clearcoat: 1,
    envMapIntensity: 1.6,
    depthWrite: false,
  });
  const layers = [
    new THREE.Mesh(blueGeometry, metal(color, 0.18)),
    new THREE.Mesh(silverGeometry, metal("#e7e9f1", 0.17)),
    new THREE.Mesh(glassGeometry, glassMaterial),
  ];
  const names = ["blue-ribbon", "silver-ribbon", "glass-ribbon"];
  layers.forEach((mesh, i) => {
    mesh.name = names[i];
    mesh.castShadow = i !== 2;
    mesh.receiveShadow = i !== 2;
    group.add(mesh);
  });

  // Bake the common normalization into vertices so each layer can move independently.
  const bounds = new THREE.Box3().setFromObject(group);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const transform = new THREE.Matrix4()
    .makeScale(4.25 / size.x, 5 / size.y, 2.65 / size.z)
    .multiply(
      new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z),
    );
  for (const mesh of layers) {
    mesh.geometry.applyMatrix4(transform);
    mesh.geometry.computeBoundingSphere();
    mesh.userData.homePosition = mesh.position.clone();
  }
  group.userData.layerDirections = [
    new THREE.Vector3(-0.7, 0.25, 0.3),
    new THREE.Vector3(0.85, 0.15, -0.05),
    new THREE.Vector3(-0.35, 0.5, -0.65),
  ];
  return group;
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}

function makeParticles(color: string) {
  const group = new THREE.Group();
  const count = 6500;
  const random = seededRandom(8043);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    // Random order makes setDrawRange thin the entire sculpture evenly.
    seeds[i * 4] = random() * TAU;
    seeds[i * 4 + 1] = 0.12 + Math.pow(random(), 0.6) * 0.68;
    seeds[i * 4 + 2] = random() * 2 - 1;
    seeds[i * 4 + 3] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1.7);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: `
      attribute vec4 aSeed;
      uniform float uTime;
      varying float vAlpha;
      varying float vHighlight;
      void main() {
        float a = aSeed.x + uTime * (0.24 + aSeed.w * 0.12) + aSeed.z * 3.2;
        float r = aSeed.y * (0.65 + 0.28 * cos(aSeed.z * 6.0 - uTime * 0.35));
        vec3 p = vec3(cos(a) * r, aSeed.z * 1.02, sin(a) * r);
        p.x += 0.17 * sin(aSeed.z * 4.2 + uTime * 0.2);
        p.y += 0.055 * sin(a * 3.0 + uTime * 0.5);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp((2.5 + 3.7 * aSeed.w) * 4.6 / max(0.4, -mv.z), 1.3, 14.0);
        vAlpha = 0.48 + aSeed.w * 0.47;
        vHighlight = pow(aSeed.w, 6.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      varying float vHighlight;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        float core = 1.0 - smoothstep(0.15, 0.9, d);
        vec3 color = mix(uColor, vec3(0.82, 0.91, 1.0), vHighlight * 0.75);
        gl_FragColor = vec4(color * (0.8 + core * 1.8), core * vAlpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.name = "particle-vortex";
  group.add(points);
  return {
    group,
    update: (phase: number) => {
      material.uniforms.uTime.value = phase;
    },
    configure: (params: ExhibitParameters) => {
      geometry.setDrawRange(0, Math.floor(count * params.density));
      material.uniforms.uColor.value.set(params.color);
    },
  };
}

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
export function createExhibit(kind: ExhibitKind, color: string): THREE.Group {
  const exhibit =
    kind === "particles"
      ? makeParticles(color)
      : kind === "liquid"
        ? makeLiquid(color)
        : makeLight(color);
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
