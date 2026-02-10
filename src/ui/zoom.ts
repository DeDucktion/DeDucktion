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

function getTreeBounds() {
  const canvas = document.getElementById("canvas")!;
  return {
    width: canvas.scrollWidth,
    height: canvas.scrollHeight
  };
}

export function fitTreeToViewport() {
  const canvas = document.getElementById("canvas")!;
  const view = document.getElementById("proofViewport")!;

  const tree = getTreeBounds();
  const vw = view.clientWidth;
  const vh = view.clientHeight;

  if (tree.width === 0 || tree.height === 0) return;

  const padding = 40;
  const scale = Math.min(
    (vw - padding) / tree.width,
    (vh - padding) / tree.height,
    1
  );

  const offsetX = (vw - tree.width * scale) / 2;
  const offsetY = (vh - tree.height * scale) / 2;

  setTransform(scale, offsetX, offsetY);
}