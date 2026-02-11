let scale = 1;
let offsetX = 0;
let offsetY = 0;

export function setTransform(s: number, x: number, y: number) {
  scale = s;
  offsetX = x;
  offsetY = y;
  apply();
}

export function getTransform() {
  return { scale, offsetX, offsetY };
}

function apply() {
  const layer = document.getElementById("transformLayer")!;
  layer.style.transform =
    `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

export function fitTreeToViewport() {
  requestAnimationFrame(() => {
    const canvas = document.getElementById("canvas")!;
    const view = document.getElementById("proofViewport")!;

    const treeW = canvas.scrollWidth;
    const treeH = canvas.scrollHeight;
    if (treeW === 0 || treeH === 0) return;

    const vw = view.clientWidth;
    const vh = view.clientHeight;
    const padding = 40;

    const { scale, offsetX, offsetY } = getTransform();

    const requiredScale = Math.min(
      (vw - padding) / treeW,
      (vh - padding) / treeH,
      1
    );

    if (requiredScale < scale) {
      setTransform(requiredScale, offsetX, offsetY);
    }
  });
}

export function centerTree() {
  const canvas = document.getElementById("canvas")!;
  const view = document.getElementById("proofViewport")!;
  const { width, height } = canvas.getBoundingClientRect();

  const vw = view.clientWidth;
  const vh = view.clientHeight;

  setTransform(
    1,
    (vw - width) / 2,
    (vh - height) / 4
  );
}