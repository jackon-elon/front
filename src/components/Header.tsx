import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAmbientSound } from "../hooks/useAmbientSound";
import { useLab } from "../state/LabContext";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { CollectionModal } from "./CollectionModal";
import type { Quality } from "../state/model";

export function Header() {
  const [menu, setMenu] = useState(false);
  const [collection, setCollection] = useState(false);
  const { settings, updateSettings, saved, favorites } = useLab();
  const sound = useAmbientSound();
  return (
    <>
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="FORM & FLOW 首页">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
          </span>
          <span>
            FORM & FLOW<small>交互实验室</small>
          </span>
        </NavLink>
        <nav className="desktop-nav" aria-label="主导航">
          <NavLink to="/" end>
            探索
          </NavLink>
          <NavLink to="/works">作品</NavLink>
          <NavLink to="/about">关于</NavLink>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button sound-button"
            aria-label={sound.enabled ? "关闭环境声音" : "开启环境声音"}
            aria-pressed={sound.enabled}
            onClick={sound.toggle}
          >
            <Icon name={sound.enabled ? "sound" : "mute"} />
          </button>
          <button
            className="menu-button"
            aria-label="打开菜单"
            onClick={() => setMenu(true)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>
      <Modal
        open={menu}
        title="空间导航"
        onClose={() => setMenu(false)}
        className="menu-modal"
      >
        <nav className="menu-links" aria-label="菜单导航">
          {[
            ["/", "进入空间"],
            ["/works", "全部作品"],
            ["/about", "关于实验室"],
          ].map(([path, title], i) => (
            <NavLink key={path} to={path} onClick={() => setMenu(false)}>
              <small>0{i + 1}</small>
              {title}
              <Icon name="arrow" />
            </NavLink>
          ))}
        </nav>
        <button
          className="collection-link"
          onClick={() => {
            setMenu(false);
            setCollection(true);
          }}
        >
          <Icon name="heart" /> 我的收藏{" "}
          <span>{saved.length + favorites.length}</span>
        </button>
        <div className="menu-settings">
          <label htmlFor="quality">
            画面质量
            <select
              id="quality"
              value={settings.quality}
              onChange={(event) =>
                updateSettings({ quality: event.target.value as Quality })
              }
            >
              <option value="auto">平衡</option>
              <option value="high">高清</option>
              <option value="eco">节能</option>
            </select>
          </label>
          <label className="check-setting">
            <span>
              减少动态效果<small>固定自主运动，保留滚动切换</small>
            </span>
            <input
              type="checkbox"
              checked={settings.motion === "reduced"}
              onChange={(event) =>
                updateSettings({
                  motion: event.target.checked ? "reduced" : "auto",
                })
              }
            />
          </label>
        </div>
        <p className="menu-footer">TAKE YOUR TIME. LOOK A LITTLE CLOSER.</p>
      </Modal>
      <CollectionModal open={collection} onClose={() => setCollection(false)} />
    </>
  );
}
