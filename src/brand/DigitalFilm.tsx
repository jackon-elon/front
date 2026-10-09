import { useId, useState } from "react";
import {
  Scan,
  FileText,
  ShieldCheck,
  Share2,
  Check,
  ChevronLeft,
} from "lucide-react";
import { ImageFrame } from "./ImageFrame";

export function DigitalFilm({
  compact = false,
  interactive = false,
}: {
  compact?: boolean;
  interactive?: boolean;
}) {
  const [view, setView] = useState<"image" | "report">("image");
  const [sharing, setSharing] = useState(false);
  const [includeReport, setIncludeReport] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const shareId = useId();
  return (
    <div
      className={`digital-film-phone ${compact ? "compact" : ""} ${interactive ? "interactive" : ""}`}
      aria-label="数字影像移动端界面设计示意"
    >
      <div className="phone-camera" />
      <div className="phone-heading">
        <span>影联网</span>
        <b>我的影像</b>
        <small>数字影像 · 设计示意</small>
      </div>
      <div className="phone-study">
        <Scan size={19} />
        <div>
          <strong>MR · 关节影像</strong>
          <span>影像与报告，一起查看。</span>
        </div>
      </div>
      {interactive && (
        <div className="phone-view-switch">
          <button
            aria-pressed={view === "image"}
            onClick={() => setView("image")}
          >
            影像
          </button>
          <button
            aria-pressed={view === "report"}
            onClick={() => setView("report")}
          >
            报告
          </button>
        </div>
      )}
      {view === "image" ? (
        <div className="phone-images">
          {[1, 4].map((i) => (
            <ImageFrame frame={i} key={i} />
          ))}
        </div>
      ) : (
        <div className="phone-report-page">
          <FileText size={24} />
          <h3>检查报告</h3>
          <dl>
            <dt>检查方式</dt>
            <dd>MR · 合成影像</dd>
            <dt>影像所见</dt>
            <dd>待医生填写</dd>
            <dt>专业意见</dt>
            <dd>待医生复核</dd>
          </dl>
        </div>
      )}
      {interactive ? (
        <button
          className="phone-report"
          onClick={() => setView(view === "image" ? "report" : "image")}
        >
          <FileText size={18} />
          <div>
            <b>{view === "image" ? "检查报告" : "返回影像"}</b>
            <span>资料与影像，连续查看。</span>
          </div>
          <span>查看</span>
        </button>
      ) : (
        <div className="phone-report">
          <FileText size={18} />
          <div>
            <b>检查报告</b>
            <span>结构化信息 · 展示示意</span>
          </div>
          <span>查看</span>
        </div>
      )}
      {interactive ? (
        <button
          className="phone-share"
          onClick={() => {
            setSharing(true);
            setConfirmed(false);
          }}
        >
          <Share2 size={16} /> 选择分享范围
        </button>
      ) : (
        <div className="phone-share">
          <ShieldCheck size={16} /> 影像分享，由你选择。
        </div>
      )}
      {sharing && (
        <div className="phone-sharing">
          <button
            className="phone-sharing-back"
            aria-label="关闭分享范围"
            onClick={() => setSharing(false)}
          >
            <ChevronLeft size={17} />
            返回
          </button>
          <h3>由你选择。</h3>
          <p>仅演示分享范围，不发送资料。</p>
          <div className="phone-share-item">
            <Check size={17} /> 影像资料
          </div>
          <label className="phone-share-item" htmlFor={shareId}>
            <input
              id={shareId}
              type="checkbox"
              checked={includeReport}
              onChange={(e) => {
                setIncludeReport(e.target.checked);
                setConfirmed(false);
              }}
            />{" "}
            检查报告
          </label>
          <button className="phone-confirm" onClick={() => setConfirmed(true)}>
            确认分享范围
          </button>
          <p role="status">
            {confirmed ? `已选择：影像${includeReport ? "与报告" : ""}。` : ""}
          </p>
        </div>
      )}
      <div className="phone-home" />
    </div>
  );
}
