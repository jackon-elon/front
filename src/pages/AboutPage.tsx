import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { useLab } from "../state/LabContext";

export default function AboutPage() {
  const { setAppearance } = useLab();
  useEffect(() => {
    setAppearance("light");
  }, [setAppearance]);
  return (
    <main className="about-page">
      <span className="eyebrow">ABOUT / AN OPEN-ENDED EXPERIMENT</span>
      <h1>
        保持好奇。
        <br />
        让想象<span>发生。</span>
      </h1>
      <div className="about-layout">
        <div className="about-symbol" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="about-copy">
          <h2>
            FORM & FLOW
            <br />
            <small>交互实验室</small>
          </h2>
          <p>
            这里是一个关于形态、材料与运动的小型数字空间。没有标准答案，也没有必须遵循的路线。
          </p>
          <p>
            你可以靠近一件作品，放慢它的节奏，或者换一种颜色。每一次微小的改变，都是新的观看方式。
          </p>
          <p>我们相信，好奇心本身就值得被认真对待。</p>
          <Link className="button button-dark" to="/works">
            开始一次实验 <Icon name="arrow" />
          </Link>
        </div>
      </div>
      <div className="about-principles">
        <div>
          <span>01</span>
          <h3>感受形态</h3>
          <p>用一点时间，观察运动中的细节。</p>
        </div>
        <div>
          <span>02</span>
          <h3>改变规则</h3>
          <p>亲手调整，把偶然变成自己的选择。</p>
        </div>
        <div>
          <span>03</span>
          <h3>留下瞬间</h3>
          <p>保存一组喜欢的参数，下次继续探索。</p>
        </div>
      </div>
      <footer className="page-footer">
        <span>FORM & FLOW © 2026</span>
        <Link to="/">BACK TO THE BEGINNING ↗</Link>
      </footer>
    </main>
  );
}
