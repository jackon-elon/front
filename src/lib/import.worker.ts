import { importLogs, mergeSessions } from "../../shared/parsers";
import { snapshotSchema, type Provider } from "../../shared/schema";
import { ZodError } from "zod";
self.onmessage = (
  e: MessageEvent<{
    files: { text: string; name: string }[];
    provider: Provider;
  }>,
) => {
  try {
    const { files, provider } = e.data;
    const sessions = mergeSessions(
      files.flatMap((f) => {
        try {
          const parsed = JSON.parse(f.text);
          const normalized = snapshotSchema.safeParse(parsed);
          if (normalized.success) return normalized.data.sessions;
        } catch {
          /* JSONL is parsed below */
        }
        return importLogs(f.text, provider);
      }),
    );
    if (!sessions.length) throw new Error("文件中没有找到受支持的有效用量记录");
    const snapshot = snapshotSchema.parse({
      version: 1,
      mode: "import",
      generatedAt: new Date().toISOString(),
      sessions,
      sources: [...new Set(sessions.map((s) => s.provider))].map((source) => ({
        provider: source,
        status: "ready",
        files: files.length,
        skipped: 0,
        message: "从用户选择的文件导入，数据仅保存在此浏览器",
      })),
    });
    self.postMessage({ snapshot });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof SyntaxError
          ? "文件不是有效的 JSON / JSONL，请检查格式，或重新导出完整日志。"
          : error instanceof ZodError
            ? "文件中的用量字段不符合格式要求，请检查时间、Token 数值和会话标识。"
            : error instanceof Error
              ? error.message
              : "无法识别文件",
    });
  }
};
