import {
  Building2,
  Cloud,
  FileText,
  FolderOpen,
  Check,
  ShieldCheck,
  Share2,
  Users,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import "./highlight-art.css";
const qualitySteps = [
  { icon: FolderOpen, label: "关联检查资料" },
  { icon: FileText, label: "组织报告框架" },
  { icon: ShieldCheck, label: "保留专业复核" },
] as const;

export function HighlightArt({
  kind,
}: {
  kind: "cloud" | "film" | "ai" | "care";
}) {
  if (kind === "cloud")
    return (
      <div className="highlight-art network-art" aria-hidden="true">
        <svg viewBox="0 0 1000 390" preserveAspectRatio="none">
          <path d="M365 210C480 210 500 80 680 80M365 210H680M365 210C480 210 510 340 680 340" />
        </svg>
        <div className="network-art-hub">
          <Cloud size={70} strokeWidth={1.1} />
          <span>影像相连</span>
          <small>连接区域专业资源</small>
        </div>
        <div className="network-art-nodes">
          {["区域中心", "综合医院", "基层机构"].map((name) => (
            <div key={name}>
              <Building2 size={29} strokeWidth={1.4} />
              <span>{name}</span>
              <i />
            </div>
          ))}
        </div>
      </div>
    );
  if (kind === "film")
    return (
      <div className="highlight-art film-art" aria-hidden="true">
        <div className="film-art-back">
          <FolderOpen size={44} strokeWidth={1.2} />
          <span>检查资料</span>
          <i />
          <i />
        </div>
        <div className="film-art-report">
          <FileText size={38} strokeWidth={1.2} />
          <span>数字影像与报告</span>
          <h4>
            轻便查看。
            <br />
            安心分享。
          </h4>
          <div>
            <ShieldCheck size={22} />
            <span>分享范围，由你选择。</span>
          </div>
        </div>
        <div className="film-art-share">
          <Share2 size={32} strokeWidth={1.5} />
        </div>
      </div>
    );
  if (kind === "ai")
    return (
      <div className="highlight-art quality-art" aria-hidden="true">
        <div className="quality-art-label">
          <span>专业判断</span>
          <strong>
            清晰。
            <br />
            有序。
            <br />
            可复核。
          </strong>
        </div>
        <div className="quality-art-list">
          {qualitySteps.map(({ icon: Icon, label }) => (
            <div key={label}>
              <Icon size={29} strokeWidth={1.3} />
              <span>{label}</span>
              <Check size={22} />
            </div>
          ))}
        </div>
      </div>
    );
  return (
    <div className="highlight-art collaboration-art" aria-hidden="true">
      <div className="collaboration-art-team">
        <Users size={55} strokeWidth={1.2} />
        <strong>专业团队</strong>
        <span>跨院协作 · 共同阅片</span>
      </div>
      <div className="collaboration-art-message">
        <MessageSquare size={28} strokeWidth={1.3} />
        <p>资料已就绪。</p>
        <p>
          一起阅片，协同复核。
          <ArrowUpRight size={22} />
        </p>
        <span>医疗机构 ↔ 专业支持</span>
      </div>
    </div>
  );
}
