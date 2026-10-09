import { useId, useState, type FormEvent } from "react";
import { findArtwork, type ArtworkKind } from "../data/artworks";
import { useLab } from "../state/LabContext";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

export function ExperimentPanel({
  kind,
  compact = false,
}: {
  kind: ArtworkKind;
  compact?: boolean;
}) {
  const id = useId();
  const lab = useLab();
  const [saveOpen, setSaveOpen] = useState(false);
  const [title, setTitle] = useState("");
  const artwork = findArtwork(kind)!;
  const colors = ["#2455ff", "#b9a0ff", "#4ee7b7", "#ff7945"];

  function save(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    lab.saveExperiment(kind, title);
    setSaveOpen(false);
  }

  return (
    <>
      <aside
        className={"experiment-panel " + (compact ? "compact" : "")}
        aria-label="实验参数"
      >
        <div className="panel-heading">
          <span>让它成为你的形状</span>
          <button
            className="icon-button"
            onClick={() => lab.updateSettings({ paused: !lab.settings.paused })}
            aria-label={lab.settings.paused ? "继续动画" : "暂停动画"}
          >
            <Icon name={lab.settings.paused ? "play" : "pause"} />
          </button>
        </div>
        {kind === "particles" && !compact && (
          <div className="field-controls">
            <span className="field-control-label">重组形态</span>
            <div className="field-formations" aria-label="粒子形态">
              {(
                [
                  ["sphere", "球体"],
                  ["helix", "螺旋"],
                  ["vortex", "涡环"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  aria-pressed={lab.settings.formation === value}
                  onClick={() => lab.updateSettings({ formation: value })}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="field-interaction" aria-label="鼠标力场">
              <span>鼠标力场</span>
              <button
                aria-pressed={lab.settings.interaction === "repel"}
                onClick={() => lab.updateSettings({ interaction: "repel" })}
              >
                推开
              </button>
              <button
                aria-pressed={lab.settings.interaction === "attract"}
                onClick={() => lab.updateSettings({ interaction: "attract" })}
              >
                吸引
              </button>
            </div>
          </div>
        )}
        <label className="slider-row" htmlFor={id + "-density"}>
          <span>{kind === "particles" ? "粒子密度" : "形态细节"}</span>
          <output>{Math.round(lab.settings.density * 100)}%</output>
          <input
            id={id + "-density"}
            type="range"
            min="15"
            max="100"
            step="1"
            value={Math.round(lab.settings.density * 100)}
            onChange={(event) =>
              lab.updateSettings({ density: Number(event.target.value) / 100 })
            }
          />
        </label>
        <label className="slider-row" htmlFor={id + "-speed"}>
          <span>流动速度</span>
          <output>{lab.settings.speed.toFixed(2)}×</output>
          <input
            id={id + "-speed"}
            type="range"
            min="20"
            max="200"
            step="5"
            value={Math.round(lab.settings.speed * 100)}
            onChange={(event) =>
              lab.updateSettings({ speed: Number(event.target.value) / 100 })
            }
          />
        </label>
        <div className="color-row">
          <span>色彩</span>
          <div className="color-swatches">
            {colors.map((color) => (
              <button
                key={color}
                style={{ backgroundColor: color }}
                className={
                  "color-swatch " +
                  (lab.settings.color === color ? "selected" : "")
                }
                onClick={() => lab.updateSettings({ color })}
                aria-label={"使用颜色 " + color}
                aria-pressed={lab.settings.color === color}
              >
                {lab.settings.color === color && <Icon name="check" />}
              </button>
            ))}
            <label className="custom-color" aria-label="自定义颜色">
              <input
                type="color"
                value={lab.settings.color}
                aria-label="自定义颜色"
                onChange={(event) =>
                  lab.updateSettings({ color: event.target.value })
                }
              />
              <span>＋</span>
            </label>
          </div>
        </div>
        <div className="panel-actions">
          <button className="button button-outline" onClick={lab.resetSettings}>
            <Icon name="reset" /> 重置
          </button>
          <button
            className="button button-light"
            onClick={() => {
              setTitle(artwork.title + " · 我的版本");
              setSaveOpen(true);
            }}
          >
            收藏实验 <Icon name="heart" />
          </button>
        </div>
        {!compact && (
          <p className="panel-note">
            {kind === "particles"
              ? "移动鼠标触碰粒子，观察散开与回弹。形态与力场也会随实验保存。"
              : "参数自动记住。移动鼠标，换一个角度看。"}
          </p>
        )}
      </aside>
      <Modal
        open={saveOpen}
        title="保存这个瞬间"
        onClose={() => setSaveOpen(false)}
      >
        <form onSubmit={save} className="save-form">
          <label htmlFor={id + "-name"}>给你的实验起个名字</label>
          <input
            id={id + "-name"}
            data-autofocus
            value={title}
            required
            maxLength={40}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：一束蓝色的流动"
          />
          <p>
            保存作品类型、色彩、密度、速度，以及粒子形态和鼠标力场，之后可在“我的收藏”中恢复。
          </p>
          {!lab.persistent && (
            <p role="status">
              当前浏览器无法持久保存，本次收藏会在关闭页面后丢失。
            </p>
          )}
          <button
            className="button button-dark"
            type="submit"
            disabled={!title.trim()}
          >
            保存实验 <Icon name="arrow" />
          </button>
        </form>
      </Modal>
    </>
  );
}
