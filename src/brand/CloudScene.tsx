import { useId, useState } from "react";
import {
  Building2,
  Cloud,
  Network,
  FileText,
  ArrowUpRight,
  Mic,
  MicOff,
  MonitorUp,
  Video,
  Check,
  Users,
  MessageSquare,
  FolderOpen,
  UserRound,
} from "lucide-react";
import { ImageFrame } from "./ImageFrame";
import { DigitalFilm } from "./DigitalFilm";
import { usePresentationMotion } from "./ui";

const institutions = [
  {
    name: "区域中心",
    role: "组织区域影像资源",
    detail: "在同一个协作空间，连接影像、报告和专业支持。",
  },
  {
    name: "综合医院",
    role: "专业阅片支持",
    detail: "从共享的检查资料开始，组织专业阅片和报告复核。",
  },
  {
    name: "基层机构",
    role: "检查资料流转",
    detail: "让基层检查与区域专业支持，在一条路径上衔接。",
  },
] as const;
function RegionalCloud() {
  const [institution, setInstitution] = useState(0);
  const selected = institutions[institution];
  return (
    <div
      className="regional-console scene-console"
      aria-label="区域影像连接演示"
    >
      <div className="scene-console-bar">
        <span>
          <Network size={17} />
          影联网 <b>区域协同</b>
        </span>
        <small>连接示意</small>
      </div>
      <div className="regional-layout">
        <aside className="regional-sidebar">
          <span>医疗网络</span>
          {institutions.map((item, i) => (
            <button
              key={item.name}
              aria-pressed={institution === i}
              onClick={() => setInstitution(i)}
            >
              <Building2 size={17} />
              <span>{item.name}</span>
              <i />
            </button>
          ))}
          <p>点击机构，查看连接路径。</p>
        </aside>
        <div className="regional-network">
          <div className="regional-map-label">
            <span>区域连接</span>
            <p>同一份资料。更多专业支持。</p>
          </div>
          <svg
            viewBox="0 0 600 440"
            aria-hidden="true"
            className="regional-map"
          >
            <path d="M115 32 265 14 394 73 510 136 553 258 482 395 330 426 178 356 51 246 76 127Z" />
            <path d="m115 32 63 128 150 38 66-125m-216 87-127 86m127-86v196m0-196 150 38 225 60m-225-60 2 228m-2-228 154 197" />
            <path
              className="network-route"
              d="M301 236 173 137M301 236 437 135M301 236 442 344"
            />
          </svg>
          <div className="regional-hub">
            <Cloud size={37} strokeWidth={1.4} />
            <strong>影像云</strong>
            <span>资料相连 · 专业协同</span>
          </div>
          {institutions.map((item, i) => (
            <button
              key={item.name}
              className={`regional-node node-${i}`}
              aria-label={`查看${item.name}连接`}
              aria-pressed={institution === i}
              onClick={() => setInstitution(i)}
            >
              <Building2 size={20} />
              <span>{item.name}</span>
            </button>
          ))}
          <span className="regional-map-note">
            网络为设计示意，不代表实际机构分布。
          </span>
        </div>
        <div className="regional-detail">
          <span className="scene-overline">连接路径</span>
          <h3>{selected.name}</h3>
          <p>{selected.detail}</p>
          <div className="regional-study">
            <span className="regional-study-icon">
              <FolderOpen size={27} />
            </span>
            <div>
              <strong>共享影像资料</strong>
              <span>MR · 合成示意</span>
            </div>
          </div>
          <div className="regional-document">
            <FileText size={22} />
            <div>
              <strong>{selected.role}</strong>
              <span>影像与报告 · 协同查看</span>
            </div>
          </div>
          <div className="regional-journey">
            <span>检查资料</span>
            <ArrowUpRight size={15} />
            <span>专业复核</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function DigitalFilmScene() {
  return (
    <div className="digital-film-scene" aria-label="数字影像与报告查看演示">
      <div className="digital-scene-copy">
        <span className="scene-overline">不必带着胶片</span>
        <h3>
          你的影像。
          <br />
          就在手边。
        </h3>
        <p>
          检查影像与报告，
          <br />
          在手机里连续查看。
        </p>
        <div>
          <MonitorUp size={23} />
          <span>
            可以点击手机里的
            <br />
            影像、报告和分享按钮。
          </span>
        </div>
      </div>
      <div className="digital-phone-display">
        <DigitalFilm interactive />
      </div>
      <div className="digital-paper">
        <div>
          <FileText size={25} />
          <span>检查报告</span>
        </div>
        <h4>
          一份报告。
          <br />
          与影像一起。
        </h4>
        <dl>
          <dt>检查方式</dt>
          <dd>MR</dd>
          <dt>影像资料</dt>
          <dd>合成展示序列</dd>
          <dt>所见与结论</dt>
          <dd>由专业医生完善</dd>
        </dl>
        <p>
          <Check size={16} />
          资料分享，由你选择。
        </p>
      </div>
    </div>
  );
}
function RemoteConsultation() {
  const noteId = useId();
  const [sharing, setSharing] = useState(true);
  const [muted, setMuted] = useState(false);
  const [notes, setNotes] = useState(false);
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <div
      className="consultation-console scene-console"
      aria-label="远程会诊协作演示"
    >
      <div className="scene-console-bar">
        <span>
          <Users size={17} />
          影联网 <b>远程会诊</b>
        </span>
        <small>交互概念 · 无实际通话</small>
      </div>
      <div className="consultation-layout">
        <div className="consultation-view">
          <div className="consultation-view-heading">
            <span>{sharing ? "正在展示影像" : "影像共享已暂停"}</span>
            <span>MR · 合成示意</span>
          </div>
          {sharing ? (
            <div className="consultation-images">
              <ImageFrame frame={1} />
              <ImageFrame frame={4} />
            </div>
          ) : (
            <div className="consultation-placeholder">
              <MonitorUp size={42} />
              <p>由你决定，共享什么。</p>
              <button onClick={() => setSharing(true)}>恢复影像展示</button>
            </div>
          )}
          <div className="consultation-caption">
            <FileText size={16} />
            <span>资料核对 → 协同阅片 → 专业复核</span>
          </div>
        </div>
        <div className="consultation-people">
          {notes ? (
            <div className="consultation-memo">
              <span className="scene-overline">会诊纪要</span>
              <h3>把讨论，留在这里。</h3>
              <label htmlFor={noteId}>演示讨论事项</label>
              <textarea
                id={noteId}
                value={memo}
                placeholder="填写资料核对或协作事项…"
                onChange={(e) => {
                  setMemo(e.target.value);
                  setSaved(false);
                }}
              />
              <button disabled={!memo.trim()} onClick={() => setSaved(true)}>
                保留本页纪要
              </button>
              <p role="status">
                {saved
                  ? "纪要已保留在本次页面演示中。"
                  : "不连接实际会诊或患者资料。"}
              </p>
            </div>
          ) : (
            <>
              <div className="consultation-participant">
                <div className="consultation-avatar">
                  <UserRound size={63} strokeWidth={1.2} />
                  <strong>专业阅片</strong>
                  <small>协作角色 · 设计示意</small>
                </div>
                <span>
                  <i />
                  专业阅片团队
                </span>
                <Video size={17} />
              </div>
              <div className="consultation-participant secondary">
                <div className="consultation-avatar">
                  <Building2 size={63} strokeWidth={1.2} />
                  <strong>医疗机构</strong>
                  <small>协作角色 · 设计示意</small>
                </div>
                <span>
                  <i />
                  医疗机构
                </span>
                <Video size={17} />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="consultation-controls">
        <span>
          <i />
          协作空间 · 设计演示
        </span>
        <div>
          <button
            aria-label={muted ? "取消静音演示" : "静音演示"}
            aria-pressed={muted}
            onClick={() => setMuted(!muted)}
          >
            {muted ? <MicOff size={19} /> : <Mic size={19} />}
            <span>{muted ? "已静音" : "麦克风"}</span>
          </button>
          <button aria-pressed={sharing} onClick={() => setSharing(!sharing)}>
            <MonitorUp size={19} />
            <span>{sharing ? "暂停共享" : "共享影像"}</span>
          </button>
          <button aria-pressed={notes} onClick={() => setNotes(!notes)}>
            <MessageSquare size={19} />
            <span>{notes ? "返回会诊" : "会诊纪要"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
export function CloudScene({ mode }: { mode: number }) {
  const reduce = usePresentationMotion();
  return (
    <div
      className={`cloud-scene cloud-scene-${mode}`}
      data-motion={reduce ? "off" : "on"}
      data-scene={
        mode === 0 ? "regional" : mode === 1 ? "digital" : "consultation"
      }
    >
      <div hidden={mode !== 0}>
        <RegionalCloud />
      </div>
      <div hidden={mode !== 1}>
        <DigitalFilmScene />
      </div>
      <div hidden={mode !== 2}>
        <RemoteConsultation />
      </div>
    </div>
  );
}
