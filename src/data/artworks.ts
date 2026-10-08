export const artworkKinds = ["particles", "liquid", "light"] as const;
export type ArtworkKind = (typeof artworkKinds)[number];

export interface Artwork {
  kind: ArtworkKind;
  number: string;
  title: string;
  english: string;
  tagline: string;
  description: string;
  tags: string[];
}

export const artworks: Artwork[] = [
  {
    kind: "particles",
    number: "01",
    title: "粒子流场",
    english: "PARTICLE FIELD",
    tagline: "让微小的运动，形成一种秩序。",
    description:
      "一束粒子沿着看不见的曲线流动。移动鼠标改变观察角度，调节密度与速度，寻找属于你的流动节奏。",
    tags: ["粒子", "交互"],
  },
  {
    kind: "liquid",
    number: "02",
    title: "液态形变",
    english: "LIQUID FORM",
    tagline: "流动的边界，凝固的瞬间。",
    description:
      "光线沿着折叠的金属表面游走。缓慢转动、交织的曲面在每个角度都呈现不同的形态，让材质成为空间的一部分。",
    tags: ["材质", "形变"],
  },
  {
    kind: "light",
    number: "03",
    title: "光影装置",
    english: "LIGHT STUDY",
    tagline: "用光，重新描述空间。",
    description:
      "透明晶体和锐利的切面把光分成无数种层次。探索旋转、色彩与反射的关系，观察一件装置如何改变整个空间。",
    tags: ["光影", "几何"],
  },
];

export function isArtworkKind(value: unknown): value is ArtworkKind {
  return (
    typeof value === "string" && artworkKinds.includes(value as ArtworkKind)
  );
}

export function findArtwork(kind: string | undefined): Artwork | undefined {
  return artworks.find((artwork) => artwork.kind === kind);
}
