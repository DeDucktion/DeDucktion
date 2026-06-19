let scale = 1;
let offsetX = 0;
let offsetY = 0;

const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
const DOT_SPACING = 24;

let rafId: number | null = null;
let animId: number | null = null;

export function clampScale(s: number): number {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
}

export function setTransform(s: number, x: number, y: number) {
    cancelAnimation();
    scale = clampScale(s);
    offsetX = x;
    offsetY = y;
    scheduleApply();
}

export function getTransform() {
    return { scale, offsetX, offsetY };
}

function scheduleApply() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
        rafId = null;
        apply();
    });
}

function apply() {
    const layer = document.getElementById("transformLayer");
    if (!layer) return;

    const dpr = window.devicePixelRatio || 1;
    const x = Math.round(offsetX * dpr) / dpr;
    const y = Math.round(offsetY * dpr) / dpr;

    layer.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

    const view = document.getElementById("proofViewport");
    if (view) {
        const d = DOT_SPACING * scale;
        if (d < 12) {
            view.style.backgroundImage = "none";
        } else {
            view.style.backgroundImage = ""; // back to the CSS value
            view.style.backgroundPosition = `${x}px ${y}px`;
            view.style.backgroundSize = `${d}px ${d}px`;
        }
    }
}

export function animateTransformTo(s: number, x: number, y: number, duration = 260) {
    cancelAnimation();
    const s0 = scale,
        x0 = offsetX,
        y0 = offsetY;
    const s1 = clampScale(s);
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const k = ease(t);
        scale = s0 + (s1 - s0) * k;
        offsetX = x0 + (x - x0) * k;
        offsetY = y0 + (y - y0) * k;
        apply();
        animId = t < 1 ? requestAnimationFrame(step) : null;
    };
    animId = requestAnimationFrame(step);
}

function cancelAnimation() {
    if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
    }
}

export function centerTree() {
    const canvas = document.getElementById("canvas")!;
    const view = document.getElementById("proofViewport")!;

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const vw = view.clientWidth;
    const vh = view.clientHeight;

    setTransform(1, (vw - w) / 2, (vh - h) / 4);
}

export function centerTreePreserveScale(animate = true) {
    const canvas = document.getElementById("canvas")!;
    const view = document.getElementById("proofViewport")!;

    const treeW = canvas.offsetWidth * scale;
    const treeH = canvas.offsetHeight * scale;

    const x = (view.clientWidth - treeW) / 2;
    const y = (view.clientHeight - treeH) / 2;

    if (animate) animateTransformTo(scale, x, y);
    else setTransform(scale, x, y);
}

export function fitAndCenter(): number | null {
    const canvas = document.getElementById("canvas")!;
    const view = document.getElementById("proofViewport")!;

    const treeW = canvas.scrollWidth;
    const treeH = canvas.scrollHeight;
    if (treeW === 0 || treeH === 0) return null;

    const vw = view.clientWidth;
    const vh = view.clientHeight;
    const padding = 40;

    const s = clampScale(Math.min((vw - padding) / treeW, (vh - padding) / treeH, 1));
    const x = (vw - treeW * s) / 2;
    const y = (vh - treeH * s) / 2;

    animateTransformTo(s, x, y, 300);
    return s;
}
