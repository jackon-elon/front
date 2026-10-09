import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useStudio } from "../state/StudioContext";
import { TransitionLink } from "./TransitionLink";
import { Modal } from "./Modal";
import { Icon } from "./Icon";
export function StudioHeader() {
  const { pathname } = useLocation(),
    studio = useStudio();
  const [menu, setMenu] = useState(false);
  return (
    <>
      <header className="site-header">
        <TransitionLink to="/" className="brand" aria-label="FORM & FLOW 首页">
          <span className="brand-star" aria-hidden="true">
            ✳
          </span>
          <span>
            FORM<span className="brand-and">&</span>FLOW
            <small>INDEPENDENT DIGITAL PLAYGROUND</small>
          </span>
        </TransitionLink>
        <nav className="desktop-nav" aria-label="主导航">
          {[
            ["/", "发现"],
            ["/works", "作品"],
            ["/about", "关于"],
          ].map(([to, label]) => (
            <TransitionLink
              key={to}
              to={to}
              aria-current={
                pathname === to ||
                (to === "/works" && pathname.startsWith("/works/"))
                  ? "page"
                  : undefined
              }
            >
              {label}
            </TransitionLink>
          ))}
        </nav>
        <div className="header-actions">
          <TransitionLink
            className="header-collection"
            to="/collection"
            aria-label={`我的收藏 ${studio.favorites.length}`}
            aria-current={pathname === "/collection" ? "page" : undefined}
          >
            <Icon name="heart" />
            <span>我的收藏</span>
            <sup>{studio.favorites.length}</sup>
          </TransitionLink>
          <button
            className="menu-button icon-button"
            aria-label="打开菜单"
            onClick={() => setMenu(true)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>
      <Modal
        open={menu}
        title="随意探索。"
        onClose={() => setMenu(false)}
        className="menu-modal"
      >
        <nav className="menu-links" aria-label="菜单导航">
          {[
            ["/", "发现"],
            ["/works", "全部作品"],
            ["/collection", "我的收藏"],
            ["/about", "这里怎么玩"],
          ].map(([to, label], i) => (
            <Link to={to} key={to} onClick={() => setMenu(false)}>
              <small>0{i + 1}</small>
              {label}
              <Icon name="arrow" />
            </Link>
          ))}
        </nav>
        <label className="motion-setting">
          <span>
            减少动态效果<small>关闭自主运动，使用简洁的页面切换。</small>
          </span>
          <input
            type="checkbox"
            checked={studio.reducedMotion}
            onChange={(e) => studio.setReducedMotion(e.target.checked)}
          />
        </label>
      </Modal>
    </>
  );
}
