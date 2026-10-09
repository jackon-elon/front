import { useState } from "react";
import { TransitionLink } from "../components/TransitionLink";
import { Icon } from "../components/Icon";
const guides = [
  {
    title: "我想改某块文字，去哪里？",
    body: "首页在 DiscoverPage.tsx，作品列表在 CatalogPage.tsx，详情在 DesignPage.tsx。作品名称、介绍和标签集中在 public/catalog.json。左下角的区域定位能直接告诉你对应文件。",
    concept: "组件、props、数据驱动的界面",
  },
  {
    title: "筛选、收藏为什么会更新画面？",
    body: "筛选条件来自页面状态和地址参数；收藏来自全站共享状态。操作改变状态，React 根据状态重新组织组件。卡片身份由 key 保持，重排动画交给 useFlipList。",
    concept: "state、列表 key、派生数据、Context + reducer",
  },
  {
    title: "改颜色和保存版本怎么串起来？",
    body: "表单显示共享状态中的主色与节奏。修改输入会更新状态，同一个状态也传给封面组件。保存时记录一份参数快照；恢复版本时，把快照放回当前状态。",
    concept: "受控表单、单向数据流、状态快照、localStorage",
  },
  {
    title: "卡片展开、换页效果在哪改？",
    body: "TransitionLink 负责导航时的共享元素转场，Poster 的 transitionName 让列表封面与详情封面对应起来。普通动画和手机布局在 styles.css；首页入场与滚动揭示在 DiscoverPage.tsx。",
    concept: "路由、共享元素转场、ref、动画生命周期",
  },
  {
    title: "作品加载失败，谁处理？",
    body: "CatalogProvider 通过 fetch 读取作品，管理加载、错误与重试。离开或重试时取消旧请求，避免旧响应覆盖新数据。页面使用同一个 CatalogStatus 显示状态。",
    concept: "异步请求、effect 清理、AbortController、组件复用",
  },
];
export default function InfoPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <main className="info-page page-enter">
      <header className="page-heading">
        <div>
          <span className="eyebrow">ABOUT THIS LITTLE PLAYGROUND</span>
          <h1>
            认真好奇。
            <br />
            <em>自在创造。</em>
          </h1>
        </div>
        <p>
          这里是一个可以亲手改变的创意空间。
          <br />
          也是从实际界面认识 React 的起点。
        </p>
      </header>
      <div className="info-intro">
        <span className="info-star" aria-hidden="true">
          ✳
        </span>
        <div>
          <h2>
            让一个想法，
            <br />
            拥有自己的形状。
          </h2>
          <p>
            不需要先理解所有代码。先选一张卡片，改变一点颜色，保存一个自己的版本。观察一个操作如何改变画面，再沿着区域名称找到它背后的组件和状态。
          </p>
          <TransitionLink className="button button-dark" to="/works">
            开始探索 <Icon name="arrow" />
          </TransitionLink>
        </div>
      </div>
      <section className="learning-guide" aria-labelledby="guide-title">
        <div className="shelf-heading">
          <h2 id="guide-title">从操作，认识 React。</h2>
          <span>LEARN BY CHANGING.</span>
        </div>
        {guides.map((guide, i) => (
          <article
            className={`guide-item ${open === i ? "is-open" : ""}`}
            key={guide.title}
          >
            <button
              aria-expanded={open === i}
              aria-controls={`guide-${i}`}
              onClick={() => setOpen((v) => (v === i ? null : i))}
            >
              <span>0{i + 1}</span>
              <h3>{guide.title}</h3>
              <span>{open === i ? "−" : "+"}</span>
            </button>
            <div id={`guide-${i}`} className="guide-answer" inert={open !== i}>
              <div>
                <p>{guide.body}</p>
                <span>{guide.concept}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
      <p className="info-limit">
        这是可运行的学习项目。作品为代码绘制的示例设计，没有商业客户案例；收藏和设计版本只保存到当前浏览器。
      </p>
    </main>
  );
}
