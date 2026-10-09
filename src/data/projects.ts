export const projectIds = [
  "off-grid",
  "type-wave",
  "soft-signal",
  "play-again",
  "color-field",
  "form-study",
] as const;
export type ProjectId = (typeof projectIds)[number];
export type Category = "排版" | "交互" | "色彩";
export interface Project {
  id: ProjectId;
  title: string;
  english: string;
  category: Category;
  year: string;
  color: string;
  description: string;
  tags: string[];
}
export function isProjectId(value: unknown): value is ProjectId {
  return typeof value === "string" && projectIds.includes(value as ProjectId);
}
export function readCatalog(value: unknown): Project[] {
  if (!Array.isArray(value)) throw new Error("作品数据格式不正确");
  const seen = new Set<string>();
  return value.map((item) => {
    if (
      !item ||
      !isProjectId(item.id) ||
      seen.has(item.id) ||
      typeof item.title !== "string" ||
      typeof item.english !== "string" ||
      typeof item.year !== "string" ||
      !["排版", "交互", "色彩"].includes(item.category) ||
      typeof item.color !== "string" ||
      !/^#[\da-f]{6}$/i.test(item.color) ||
      typeof item.description !== "string" ||
      !Array.isArray(item.tags) ||
      !item.tags.every((tag: unknown) => typeof tag === "string")
    )
      throw new Error("作品数据不完整，请重新加载");
    seen.add(item.id);
    return item as Project;
  });
}
