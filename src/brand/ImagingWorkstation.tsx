import {
  Scan,
  Layers,
  MousePointer2,
  Maximize2,
  FileText,
  Check,
  ShieldCheck,
  CircleHelp,
} from "lucide-react";
import { ImageFrame } from "./ImageFrame";
import { aiModes, cloudModes } from "./content";
export function ImagingWorkstation({
  mode = 0,
  compact = false,
  cloudMode,
}: {
  mode?: number;
  compact?: boolean;
  cloudMode?: number;
}) {
  const cloud = cloudMode === undefined ? null : cloudModes[cloudMode];
  const current = cloud
    ? {
        name: cloud.name,
        panelTitle: cloud.focus,
        panelIntro: cloud.description,
        items: cloud.nodes,
        document: cloud.name === "远程会诊" ? "会诊协作清单" : "影像资料与报告",
      }
    : aiModes[mode];
  return (
    <div
      className={`imaging-workstation ${compact ? "compact" : ""}`}
      aria-label={`${current.name}界面设计示意`}
    >
      <div className="reader-topbar">
        <span>
          <i /> 影联网 <b>{cloud ? "影像协作空间" : "阅片工作空间"}</b>
        </span>
        <span className="reader-design">
          界面设计示意 <Maximize2 size={14} />
        </span>
      </div>
      <div className="reader-layout">
        <div className="reader-tools" aria-hidden="true">
          {[MousePointer2, Scan, Layers, FileText, CircleHelp].map(
            (Icon, i) => (
              <span key={i} className={i === mode + 1 ? "active" : ""}>
                <Icon size={17} />
              </span>
            ),
          )}
        </div>
        <div className="reader-imaging">
          <div className="reader-study">
            <span>MR · 关节影像</span>
            <span>合成展示素材</span>
          </div>
          {mode === 2 ? (
            <div className="reader-compare">
              {[1, 4].map((frame, i) => (
                <div key={frame}>
                  <ImageFrame frame={frame} />
                  <span>{i === 0 ? "对照视图" : "当前视图"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="reader-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i}>
                  <ImageFrame frame={i} />
                  <span>0{i + 1}</span>
                </div>
              ))}
            </div>
          )}
          <div className="reader-bottom">
            <Layers size={13} />
            <span>
              {mode === 2 ? "并列查看，同步关注。" : "六帧影像，一处查看。"}
            </span>
            <span>MR</span>
          </div>
        </div>
        <div className="reader-insight">
          <span className="insight-overline">
            {cloud ? "影像云服务 · 场景设计" : "智能医学影像 · 场景概念"}
          </span>
          <h3>{current.panelTitle}</h3>
          <p>{current.panelIntro}</p>
          <div className="insight-checks">
            {current.items.map((item, i) => (
              <div key={item}>
                <span>
                  {i === 2 ? <ShieldCheck size={17} /> : <Check size={16} />}
                </span>
                <div>
                  <strong>{item}</strong>
                  <small>
                    {cloud
                      ? "协作路径 · 界面示意"
                      : i === 2
                        ? "交由专业人员确认"
                        : "演示资料已关联"}
                  </small>
                </div>
              </div>
            ))}
          </div>
          <div className="insight-document">
            <FileText size={19} />
            <span>
              {current.document}
              <small>可追溯 · 待复核</small>
            </span>
          </div>
          <div className="reader-disclaimer">
            {cloud ? "让影像与专业服务连接" : "不生成诊断结论"}
          </div>
        </div>
      </div>
    </div>
  );
}
export function DigitalFilm({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`digital-film-phone ${compact ? "compact" : ""}`}
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
      <div className="phone-images">
        {[1, 4].map((i) => (
          <ImageFrame frame={i} key={i} />
        ))}
      </div>
      <div className="phone-report">
        <FileText size={18} />
        <div>
          <b>检查报告</b>
          <span>结构化信息 · 展示示意</span>
        </div>
        <span>查看</span>
      </div>
      <div className="phone-share">
        <ShieldCheck size={16} /> 影像分享，由你选择。
      </div>
      <div className="phone-home" />
    </div>
  );
}
