let owners = 0;
let restore: (() => void) | undefined;

// Stable CSS gutters handle current browsers; compensate the measured content
// width only when hiding the scrollbar actually expands an older browser.
export function lockPageScroll() {
  if (owners++ === 0) {
    const body = document.body;
    const overflow = body.style.overflow;
    const padding = body.style.paddingRight;
    const width = body.getBoundingClientRect().width;
    const computedPadding =
      Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.overflow = "hidden";
    const expansion = body.getBoundingClientRect().width - width;
    if (expansion > 0)
      body.style.paddingRight = `${computedPadding + expansion}px`;
    restore = () => {
      body.style.overflow = overflow;
      body.style.paddingRight = padding;
    };
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--owners === 0) {
      restore?.();
      restore = undefined;
    }
  };
}
