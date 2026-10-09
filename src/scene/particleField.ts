import * as THREE from "three";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import type { LabSettings } from "../state/model";

// The same target function is used by the solver and its analytic fallback.
// A particle keeps its identity across all forms; we never swap visible clouds.
const targets = /* glsl */ `
  const float PI = 3.14159265359;
  vec3 targetPosition(vec4 seed, float morph, float time) {
    float a = seed.x * PI * 2.0;
    float y = seed.y * 2.0 - 1.0;
    float r = sqrt(max(0.0, 1.0 - y*y));
    float wave = 1.0 + 0.055 * sin(a*5.0 + y*9.0 + time*0.5);
    vec3 sphere = vec3(cos(a)*r, y, sin(a)*r) * 1.22 * wave;
    float helixAngle = a + y*5.0 + time*0.12;
    float helixRadius = 0.78 + 0.15*cos(a*3.0+y*4.0);
    vec3 helix = vec3(cos(helixAngle)*helixRadius, y*1.42,
      sin(helixAngle)*helixRadius);
    helix += normalize(vec3(cos(a), 0.25, sin(a))) * (seed.z-0.5)*0.2;
    float ring = 0.93 + 0.26*cos(a*3.0 + time*0.16);
    float tube = seed.y*PI*2.0;
    vec3 vortex = vec3((ring+0.21*cos(tube))*cos(a),
      0.28*sin(tube) + 0.25*sin(a*3.0 + time*0.16),
      (ring+0.21*cos(tube))*sin(a));
    vec3 p = mix(sphere, helix, smoothstep(0.0, 1.0, morph));
    return mix(p, vortex, smoothstep(1.0, 2.0, morph));
  }
`;

const velocityShader = /* glsl */ `
  uniform sampler2D uSeeds;
  uniform float uTime;
  uniform float uDelta;
  uniform float uMorph;
  uniform float uPointerActive;
  uniform float uInteraction;
  uniform vec3 uPointer;
  uniform float uStatic;
  ${targets}
  // Curl of a smooth vector potential: a divergence-free stirring field.
  vec3 curlField(vec3 p, float t) {
    return vec3(
      cos(p.y*2.4+t) - sin(p.z*2.0-t*0.7),
      cos(p.z*2.2+t*0.6) - sin(p.x*2.4+t),
      cos(p.x*2.0-t*0.7) - sin(p.y*2.2+t*0.6)
    );
  }
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 p = texture2D(texturePosition, uv).xyz;
    vec3 v = texture2D(textureVelocity, uv).xyz;
    vec4 seed = texture2D(uSeeds, uv);
    vec3 target = targetPosition(seed, uMorph, uTime);
    vec3 force = (target-p)*18.0 + curlField(p, uTime*0.28)*0.22;
    vec3 away = p-uPointer;
    // Depth is compressed so the cursor reaches the front/back shell as well
    // as the center plane. The force still evolves each particle's 3D velocity.
    away.z *= 0.3;
    float distanceToPointer = length(away);
    float falloff = 1.0-smoothstep(0.0, 0.85, distanceToPointer);
    force += away/max(distanceToPointer, 0.06)*falloff*13.0
      *uPointerActive*uInteraction;
    force += cross(vec3(0.0, 1.0, 0.0), away)*falloff
      *uPointerActive*1.8;
    v = (v + force*uDelta) * exp(-4.8*uDelta);
    float speed = length(v);
    v *= min(1.0, 4.0/max(speed, 0.001));
    gl_FragColor = vec4(mix(v, vec3(0.0), uStatic), 1.0);
  }
`;

const positionShader = /* glsl */ `
  uniform sampler2D uSeeds;
  uniform float uDelta;
  uniform float uTime;
  uniform float uMorph;
  uniform float uStatic;
  ${targets}
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 p = texture2D(texturePosition, uv).xyz;
    vec3 v = texture2D(textureVelocity, uv).xyz;
    vec4 seed = texture2D(uSeeds, uv);
    vec3 next = p+v*uDelta;
    // Hard bounds also recover particles after a long suspended frame.
    if (length(next)>3.5) next = targetPosition(seed, uMorph, uTime);
    next = mix(next, targetPosition(seed, uMorph, uTime), uStatic);
    gl_FragColor = vec4(next, 1.0);
  }
`;

const drawVertex = /* glsl */ `
  attribute vec2 aUv;
  attribute vec4 aSeed;
  uniform sampler2D uPositions;
  uniform sampler2D uVelocities;
  uniform float uGpu;
  uniform float uTime;
  uniform float uMorph;
  uniform float uPixelRatio;
  varying float vEnergy;
  varying float vSeed;
  ${targets}
  void main() {
    vec3 p;
    float energy = 0.0;
    if (uGpu > 0.5) {
      p = texture2D(uPositions, aUv).xyz;
      energy = length(texture2D(uVelocities, aUv).xyz);
    } else {
      p = targetPosition(aSeed, uMorph, uTime);
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((24.0+16.0*aSeed.w)*uPixelRatio/max(0.5, -mv.z),
      1.3*uPixelRatio, 7.0*uPixelRatio);
    vEnergy = energy;
    vSeed = aSeed.w;
  }
`;

const drawFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vEnergy;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord-0.5)*2.0;
    if (d>1.0) discard;
    float core = exp(-d*d*3.5);
    vec3 c = uColor*1.3 + vec3(0.025, 0.05, 0.1)*vSeed;
    c = mix(c, vec3(1.0, 0.72, 0.43), clamp(vEnergy*0.28, 0.0, 0.8));
    gl_FragColor = vec4(c*(0.9+core*0.65), core*uOpacity*0.60);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export interface ParticleField {
  group: THREE.Group;
  backend: "gpu" | "analytic";
  count: number;
  configure: (settings: LabSettings, reduced: boolean) => void;
  advance: (
    elapsed: number,
    morph: number,
    pointer: THREE.Vector3 | null,
  ) => void;
  setOpacity: (opacity: number) => void;
  dispose: () => void;
}

export function createParticleField(
  renderer: THREE.WebGLRenderer,
  color: string,
  size: number,
): ParticleField {
  const count = size * size;
  const seeds = new Float32Array(count * 4);
  const initial = new Float32Array(count * 4);
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  let randomState = 90841;
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) | 0;
    return (randomState >>> 0) / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const a = random();
    const b = random();
    seeds.set([a, b, random(), random()], i * 4);
    const theta = a * Math.PI * 2;
    const y = b * 2 - 1;
    const r = Math.sqrt(1 - y * y);
    initial.set(
      [Math.cos(theta) * r * 1.22, y * 1.22, Math.sin(theta) * r * 1.22, 1],
      i * 4,
    );
    uvs.set(
      [((i % size) + 0.5) / size, (Math.floor(i / size) + 0.5) / size],
      i * 2,
    );
  }
  const seedTexture = new THREE.DataTexture(
    seeds,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  seedTexture.needsUpdate = true;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geometry.setAttribute("aUv", new THREE.BufferAttribute(uvs, 2));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3.5);

  const uniforms = {
    uPositions: { value: seedTexture as THREE.Texture },
    uVelocities: { value: seedTexture as THREE.Texture },
    uGpu: { value: 0 },
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: 1 },
    uPixelRatio: { value: renderer.getPixelRatio() },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: drawVertex,
    fragmentShader: drawFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const group = new THREE.Group();
  const points = new THREE.Points(geometry, material);
  points.name = "simulated-particle-field";
  points.frustumCulled = false;
  group.add(points);
  group.userData.particleField = true;
  group.userData.inspectionRadius = 1.9;

  let gpu: GPUComputationRenderer | undefined;
  let positionVariable:
    ReturnType<GPUComputationRenderer["addVariable"]> | undefined;
  let velocityVariable:
    ReturnType<GPUComputationRenderer["addVariable"]> | undefined;
  const simulation = {
    uSeeds: { value: seedTexture },
    uDelta: { value: 1 / 60 },
    uTime: uniforms.uTime,
    uMorph: uniforms.uMorph,
    uPointer: { value: new THREE.Vector3() },
    uPointerActive: { value: 0 },
    uInteraction: { value: 1 },
    uStatic: { value: 0 },
  };
  // Color-buffer support is checked before allocating any simulation targets.
  if (renderer.extensions.has("EXT_color_buffer_float")) {
    try {
      gpu = new GPUComputationRenderer(size, size, renderer);
      gpu.setDataType(THREE.HalfFloatType);
      const pos = gpu.createTexture();
      (pos.image.data as Float32Array).set(initial);
      const vel = gpu.createTexture();
      positionVariable = gpu.addVariable(
        "texturePosition",
        positionShader,
        pos,
      );
      velocityVariable = gpu.addVariable(
        "textureVelocity",
        velocityShader,
        vel,
      );
      for (const variable of [positionVariable, velocityVariable]) {
        gpu.setVariableDependencies(variable, [
          positionVariable,
          velocityVariable,
        ]);
        Object.assign(variable.material.uniforms, simulation);
      }
      const error = gpu.init();
      if (error) {
        gpu.dispose();
        gpu = undefined;
      } else {
        uniforms.uGpu.value = 1;
        uniforms.uPositions.value =
          gpu.getCurrentRenderTarget(positionVariable).texture;
        uniforms.uVelocities.value =
          gpu.getCurrentRenderTarget(velocityVariable).texture;
      }
    } catch {
      gpu?.dispose();
      gpu = undefined;
      uniforms.uGpu.value = 0;
    }
  }
  const backend = gpu ? "gpu" : "analytic";
  let parameters: LabSettings;
  let reduced = false;
  let accumulator = 0;
  let lastMorph = -1;
  let time = 0;
  let reset = true;
  return {
    group,
    backend,
    count,
    configure: (settings, reduce) => {
      if (
        !parameters ||
        parameters.formation !== settings.formation ||
        reduced !== reduce
      )
        reset = true;
      parameters = settings;
      reduced = reduce;
      const budget = settings.quality === "eco" ? 0.35 : 1;
      geometry.setDrawRange(0, Math.floor(count * settings.density * budget));
      uniforms.uColor.value.set(settings.color);
      simulation.uInteraction.value =
        settings.interaction === "attract" ? -1 : 1;
    },
    advance: (elapsed, morph, pointer) => {
      if (!parameters) return;
      const active = !parameters.paused && !reduced;
      uniforms.uMorph.value = morph;
      uniforms.uPixelRatio.value = renderer.getPixelRatio();
      simulation.uPointerActive.value = pointer && active ? 1 : 0;
      if (pointer) simulation.uPointer.value.copy(pointer);
      if (active) accumulator = Math.min(accumulator + elapsed, 0.05);
      else accumulator = 0;
      const snap =
        (reduced || parameters.paused) &&
        (reset || Math.abs(lastMorph - morph) > 0.001);
      simulation.uStatic.value = snap ? 1 : 0;
      if (snap && gpu) gpu.compute();
      while (accumulator >= 1 / 60 - 0.000001) {
        time += (1 / 60) * parameters.speed;
        uniforms.uTime.value = time;
        // Speed controls phase, while the physical integrator keeps a fixed step.
        if (gpu) gpu.compute();
        accumulator -= 1 / 60;
      }
      if (gpu && positionVariable && velocityVariable) {
        uniforms.uPositions.value =
          gpu.getCurrentRenderTarget(positionVariable).texture;
        uniforms.uVelocities.value =
          gpu.getCurrentRenderTarget(velocityVariable).texture;
      }
      lastMorph = morph;
      reset = false;
    },
    setOpacity: (opacity) => {
      uniforms.uOpacity.value = opacity;
    },
    dispose: () => {
      gpu?.dispose();
      seedTexture.dispose();
      // Geometry and draw material are disposed once by the scene owner.
    },
  };
}
