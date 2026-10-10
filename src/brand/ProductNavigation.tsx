import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export const navigation = [
  { id: "cloud", name: "影像云" },
  { id: "ai", name: "影像智能" },
  { id: "agent", name: "医疗 Agent" },
  { id: "solutions", name: "解决方案" },
];

export function ProductNavigation({
  onMenu,
  onContact,
}: {
  onMenu: () => void;
  onContact: () => void;
}) {
  // Chapter tracking belongs to the navigation, not to the whole homepage.
  const [active, setActive] = useState("");
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

  return (
    <div className="product-nav">
      <div className="wrap product-nav-inner">
        <a href="#home" className="product-nav-title">
          影像产品
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
          onClick={onMenu}
        >
          产品 <Menu size={17} />
        </button>
        <button className="button small-button" onClick={onContact}>
          联系与合作
        </button>
      </div>
    </div>
  );
}
