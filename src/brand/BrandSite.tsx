import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronRight,
  Check,
  Copy,
  Mail,
  Menu,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Modal } from "../components/Modal";
import { media, products, solutions, sources } from "./content";
import { BrandMark, Reveal, Tabs } from "./ui";
import { Highlights } from "./Highlights";
import { CloudProduct } from "./CloudProduct";
import { ImagingAI } from "./ImagingAI";
import { MedicalAgent } from "./MedicalAgent";

const navigation = [
  { id: "cloud", name: "云影像" },
  { id: "ai", name: "AI 辅助诊断" },
  { id: "agent", name: "医疗 Agent" },
  { id: "solutions", name: "解决方案" },
];

function Hero() {
  const hero = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);
  return (
    <section ref={hero} className="hero" id="top" aria-labelledby="hero-title">
      <motion.div
        className="hero-visual"
        style={reduce ? {} : { y: imageY, scale: imageScale }}
      >
        <img
          src={media.anatomy}
          width="1672"
          height="941"
          fetchPriority="high"
          alt="银白色玻璃切片构成的人体头部医学影像艺术模型"
        />
      </motion.div>
      <div className="hero-shade" />
      <div className="hero-copy wrap">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <p className="eyebrow">讯飞影联 · 数智医疗</p>
          <h1 id="hero-title">
            让影像，
            <br />
            <span>连接更好的医疗。</span>
          </h1>
          <p className="hero-description">
            从云端连接，到智能洞察。
            <br />
            让专业的每一步，看得更远。
          </p>
          <div className="hero-actions">
            <a className="button blue-button" href="#products">
              探索产品 <ChevronRight size={18} />
            </a>
            <a className="hero-link" href="#solutions">
              了解解决方案 <ArrowUpRight size={18} />
            </a>
          </div>
        </motion.div>
      </div>
      <div className="hero-bottom wrap">
        <span>
          云影像 <i /> AI 辅助诊断 <i /> 医疗 Agent
        </span>
        <a href="#products" aria-label="向下探索产品">
          <ArrowDown size={20} />
        </a>
      </div>
    </section>
  );
}

function Solutions({
  onContact,
  mode,
  onChange,
}: {
  onContact: () => void;
  mode: number;
  onChange: (mode: number) => void;
}) {
  const current = solutions[mode];
  return (
    <section
      className="solutions-section section-pad"
      id="solutions"
      aria-labelledby="solutions-title"
    >
      <Reveal className="section-heading wrap">
        <div>
          <p className="eyebrow">解决方案</p>
          <h2 id="solutions-title">
            面向不同场景。
            <br />
            连接同一种关怀。
          </h2>
        </div>
        <p className="heading-aside">
          让技术融入真实的医疗协作，
          <br />
          从一家医院，到一个区域。
        </p>
      </Reveal>
      <div className="product-tabs">
        <Tabs
          labels={solutions.map((s) => s.name)}
          value={mode}
          onChange={onChange}
          label="医疗解决方案"
          panelId="solution-panel"
        />
      </div>
      <div
        className="solution-card wrap"
        id="solution-panel"
        role="tabpanel"
        aria-label={current.name}
      >
        <img
          src={media.care}
          width="1672"
          height="941"
          alt="两位医生在通透、明亮的影像阅片空间中协作，场景为生成式视觉设计"
          loading="lazy"
        />
        <div className="solution-photo-note">协作场景 · 视觉示意</div>
        <div className="solution-info">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <p className="eyebrow">{current.name}</p>
              <h3>{current.headline}</h3>
              <p>{current.text}</p>
              <ul>
                {current.points.map((point) => (
                  <li key={point}>
                    <Check size={18} />
                    {point}
                  </li>
                ))}
              </ul>
              <button className="text-link" onClick={onContact}>
                联系与合作 <ArrowUpRight size={18} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export function BrandSite() {
  const [detail, setDetail] = useState<number | null>(null);
  const [contact, setContact] = useState(false);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState("");
  const [solutionMode, setSolutionMode] = useState(0);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setActive(entry.target.id === "top" ? "" : entry.target.id);
      },
      { rootMargin: "-12% 0px -60% 0px" },
    );
    [{ id: "top" }, ...navigation].forEach((item) => {
      const target = document.getElementById(item.id);
      if (target) observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);
  const copyContact = async () => {
    try {
      await navigator.clipboard.writeText(
        "影联网公开服务信息\n客服热线：4008813959\n联系邮箱：iu@imagingunion.com\nhttps://www.imagingunion.com/iunet/login",
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const selected = detail !== null ? products[detail] : null;
  return (
    <>
      <a href="#main" className="skip-link">
        跳转到主要内容
      </a>
      <header className="global-header" id="home">
        <div className="wrap global-header-inner">
          <a href="#home" className="brand" aria-label="讯飞影联首页">
            <BrandMark />
            <span>讯飞影联</span>
          </a>
          <nav aria-label="网站导航">
            <a href="#products">产品</a>
            <a href="#solutions">解决方案</a>
            <a href="#about">关于影联</a>
          </nav>
          <a
            href={sources.platform}
            target="_blank"
            rel="noreferrer"
            className="platform-link"
          >
            影联网 <ArrowUpRight size={15} />
          </a>
          <button
            className="mobile-menu-button"
            aria-label="打开网站导航"
            onClick={() => setMenu(true)}
          >
            <Menu size={23} />
          </button>
        </div>
      </header>
      <div className="product-nav">
        <div className="wrap product-nav-inner">
          <a href="#home" className="product-nav-title">
            影像，智联。
          </a>
          <nav aria-label="产品章节">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={active === item.id ? "location" : undefined}
              >
                {item.name}
              </a>
            ))}
          </nav>
          <button
            className="chapter-menu-button"
            aria-label="浏览产品章节"
            onClick={() => setMenu(true)}
          >
            产品 <Menu size={17} />
          </button>
          <button
            className="button small-button"
            onClick={() => {
              setCopied(false);
              setContact(true);
            }}
          >
            联系与合作
          </button>
        </div>
      </div>
      <main id="main">
        <Hero />
        <Highlights onDetail={setDetail} />
        <CloudProduct />
        <ImagingAI onDetail={() => setDetail(1)} />
        <MedicalAgent />
        <Solutions
          mode={solutionMode}
          onChange={setSolutionMode}
          onContact={() => setContact(true)}
        />
        <section
          className="about-section section-pad"
          id="about"
          aria-labelledby="about-title"
        >
          <Reveal className="wrap about-content">
            <p className="eyebrow">关于讯飞影联</p>
            <h2 id="about-title">
              连接技术。
              <br />
              <span>更连接人与人。</span>
            </h2>
            <p>
              围绕云影像与医学影像
              AI，连接医疗机构、影像资源与专业协作。让技术走进诊疗路径，让优质医疗服务走得更远。
            </p>
            <div className="about-links">
              <a
                className="text-link"
                href={sources.platform}
                target="_blank"
                rel="noreferrer"
              >
                访问影联网 <ArrowUpRight size={19} />
              </a>
              <a
                className="text-link secondary-link"
                href={sources.partnership}
                target="_blank"
                rel="noreferrer"
              >
                了解公开合作动态 <ArrowUpRight size={19} />
              </a>
            </div>
          </Reveal>
        </section>
        <section className="contact-section">
          <div className="wrap">
            <p className="eyebrow">下一步，从连接开始。</p>
            <h2>一起，看见更多可能。</h2>
            <button
              className="button blue-button"
              onClick={() => {
                setCopied(false);
                setContact(true);
              }}
            >
              联系与合作 <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-top">
            <a className="brand" href="#home">
              <BrandMark />
              <span>讯飞影联</span>
            </a>
            <p>让影像，连接更好的医疗。</p>
          </div>
          <div className="footer-navigation">
            <div>
              <strong>产品与体验</strong>
              {products.map((p) => (
                <a key={p.id} href={`#${p.id}`}>
                  {p.label}
                </a>
              ))}
            </div>
            <div>
              <strong>解决方案</strong>
              {solutions.map((s, index) => (
                <a
                  key={s.name}
                  href="#solutions"
                  onClick={() => setSolutionMode(index)}
                >
                  {s.name}
                </a>
              ))}
            </div>
            <div>
              <strong>了解更多</strong>
              <a href="#about">关于讯飞影联</a>
              <a href={sources.platform} target="_blank" rel="noreferrer">
                影联网 <ExternalLink size={12} />
              </a>
              <button onClick={() => setContact(true)}>公开联系信息</button>
            </div>
            <div className="footer-note">
              <strong>设计说明</strong>
              <p>
                品牌官网设计概念，非官方站点。影像与产品界面为设计示意；医疗
                Agent 展示协同交互概念。公开信息参考影联网与数坤科技合作动态。
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>讯飞影联 · 品牌官网设计概念</span>
            <span>云影像 · 智能协作</span>
            <a href="#home">回到顶部 ↑</a>
          </div>
        </div>
      </footer>
      <Modal
        open={detail !== null}
        title={selected?.label ?? "产品详情"}
        onClose={() => setDetail(null)}
        className="product-modal"
      >
        {selected && (
          <>
            <div className={`detail-visual detail-${selected.id}`}>
              {selected.id === "agent" ? (
                <div className="detail-agent-mark">
                  <BrandMark />
                  <span>医疗 Agent</span>
                  <p>理解问题，连接行动。</p>
                </div>
              ) : (
                <img
                  src={selected.id === "cloud" ? media.care : media.anatomy}
                  alt="产品视觉设计示意"
                />
              )}
            </div>
            <div className="detail-content">
              <p className="eyebrow">{selected.eyebrow}</p>
              <h3>{selected.title}</h3>
              <p>{selected.detail}</p>
              <ul>
                {selected.features.map((feature) => (
                  <li key={feature}>
                    <Check size={18} />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={`#${selected.id}`}
                className="button blue-button"
                onClick={() => setDetail(null)}
              >
                探索{selected.label} <ChevronRight size={18} />
              </a>
            </div>
          </>
        )}
      </Modal>
      <Modal
        open={contact}
        title="从一次连接开始"
        onClose={() => setContact(false)}
        className="contact-modal"
      >
        <p className="contact-intro">
          以下为影联网公开的服务联系方式。您可以通过公开渠道进一步了解业务与合作。
        </p>
        <a className="contact-method" href="tel:4008813959">
          <Phone size={23} />
          <div>
            <span>客服热线</span>
            <strong>400 881 3959</strong>
          </div>
          <ArrowUpRight size={20} />
        </a>
        <a className="contact-method" href="mailto:iu@imagingunion.com">
          <Mail size={23} />
          <div>
            <span>联系邮箱</span>
            <strong>iu@imagingunion.com</strong>
          </div>
          <ArrowUpRight size={20} />
        </a>
        <div className="contact-modal-actions">
          <button className="button blue-button" onClick={copyContact}>
            {copied ? <Check size={17} /> : <Copy size={17} />}
            {copied ? "已复制联系方式" : "复制联系方式"}
          </button>
          <a
            className="text-link"
            href={sources.platform}
            target="_blank"
            rel="noreferrer"
          >
            访问公开服务平台 <ArrowUpRight size={17} />
          </a>
        </div>
        <p className="contact-source">
          信息来源：影联网公开页面。本设计站不接收或提交咨询信息。
        </p>
        <span role="status" className="sr-only">
          {copied ? "联系方式已复制到剪贴板" : ""}
        </span>
      </Modal>
      <Modal
        open={menu}
        title="讯飞影联"
        onClose={() => setMenu(false)}
        className="navigation-modal"
      >
        <nav aria-label="移动端网站导航">
          {[
            { id: "products", name: "产品亮点" },
            ...navigation,
            { id: "about", name: "关于影联" },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMenu(false)}
            >
              {item.name}
              <ChevronRight size={22} />
            </a>
          ))}
        </nav>
      </Modal>
    </>
  );
}
