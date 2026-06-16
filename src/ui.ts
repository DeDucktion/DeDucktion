import { appState, rule_map, rules } from ".";
import type { Derivation } from "./state";
import { findPath } from "./state";
import { parse_derivation } from "engine";
import { centerTreePreserveScale, getTransform, setTransform } from "./zoom";

function isValidFormula(text: string): boolean {
  try {
    parse_derivation({ rule: undefined, premises: [], conclusion: text });
    return true;
  } catch {
    return false;
  }
}

export function renderRuleList(container: HTMLElement) {
    container.innerHTML = "";
    for (const rule of rules) {
        const btn = document.createElement("button");
        btn.textContent = rule.label;
        btn.onclick = () => {
            const canvas = document.getElementById("canvas")!;
            const target = appState.selectedNode;
            const wasEmpty = !appState.derivation;

            let anchor: DOMRect | null = null;
            if (!wasEmpty && target) {
                const el = document.querySelector<HTMLElement>(".tree-node.selected > .conclusion-input");
                if (el) anchor = el.getBoundingClientRect();
            }

            const path = target && appState.derivation ? findPath(appState.derivation, target) : null;
            appState.pushHistory(path);

            const newNode = appState.createNode(rule.id, rule.arity);
            if (!target) {
                appState.derivation = newNode;
                appState.selectedNode = newNode;
            } else {
                newNode.conclusion = target.conclusion;
                Object.assign(target, newNode);
            }

            renderTree(canvas);

            if (wasEmpty) {
                centerTreePreserveScale(false);
            } else if (anchor) {
                const el = document.querySelector<HTMLElement>(".tree-node.selected > .conclusion-input");
                if (el) {
                    const r = el.getBoundingClientRect();
                    const { scale, offsetX, offsetY } = getTransform();
                    setTransform(scale, offsetX + (anchor.left - r.left), offsetY + (anchor.top - r.top));
                }
            }
        };
        container.appendChild(btn);
    }
}

export function attachKeyboardShortcuts(input: HTMLInputElement) {
  if (input.dataset.shortcuts === "1") return;
  input.dataset.shortcuts = "1";

  let buffer = "";

  const replacements: Record<string, string> = {
    "<": "∧",
    "and": "∧",
    "&": "∧",
    ">": "∨",
    "or": "∨",
    "|": "∨",
    "~": "¬",
    "not": "¬",
    "->": "→",
    "to": "→"
  };

  const maxLen = Math.max(...Object.keys(replacements).map(k => k.length));

  input.addEventListener("input", () => {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    buffer = input.value.slice(Math.max(0, start - maxLen), start);

    const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (buffer.endsWith(key)) {
        const replacement = replacements[key];
        const value = input.value;
        input.value = value.slice(0, start - key.length) + replacement + value.slice(end);
        input.selectionStart = input.selectionEnd = start - key.length + replacement!.length;
        buffer = "";
        input.dispatchEvent(new Event("change"));
        break;
      }
    }
  });
}

export function renderTree(container: HTMLElement) {
  container.innerHTML = "";
  if (!appState.derivation) return;
  const node = renderNode(appState.derivation);
  container.appendChild(node);
  adjustAll();
}

function clearSelectionHighlight() {
  document
    .querySelectorAll<HTMLElement>(".tree-node.selected")
    .forEach((el) => el.classList.remove("selected"));
}

function renderNode(node: Derivation): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "tree-node";

  // Premises
  const premisesContainer = document.createElement("div");
  premisesContainer.className = "premises";
  for (const p of node.premises) {
    premisesContainer.appendChild(renderNode(p));
  }

  wrapper.appendChild(premisesContainer);

  // Rule-line
  const ruleLine = document.createElement("div");
  ruleLine.className = node.rule ? "rule-line" : "rule-line hidden";
  const line = document.createElement("div");
  line.className = "line";
  line.style.visibility = "hidden";
  const label = document.createElement("span");
  label.className = "rule-label";
  label.style.visibility = "hidden";
  if (node.rule) {
    label.textContent = rule_map(node.rule) ? rule_map(node.rule)!.label : node.rule;
    ruleLine.appendChild(line);
    ruleLine.appendChild(label);
  }

  wrapper.appendChild(ruleLine);

  // Conclusion
  const conclusion = document.createElement("input");
  conclusion.className = "conclusion-input";
  conclusion.value = node.conclusion ?? "";
  conclusion.classList.toggle(
    "invalid",
    conclusion.value.trim() !== "" && !isValidFormula(conclusion.value)
  );

  const syncConclusion = () => {
    node.conclusion = conclusion.value.trim() === "" ? undefined : conclusion.value;
    conclusion.classList.toggle(
      "invalid",
      conclusion.value.trim() !== "" && !isValidFormula(conclusion.value)
    );
  };
  conclusion.oninput = syncConclusion;
  conclusion.addEventListener("change", syncConclusion);
  attachKeyboardShortcuts(conclusion);
  wrapper.appendChild(conclusion);

  wrapper.onclick = (e) => {
    e.stopPropagation();
    appState.setSelected(node);
    clearSelectionHighlight();
    wrapper.classList.add("selected");
  };
  if (node === appState.selectedNode) wrapper.classList.add("selected");

  return wrapper;
}

// Adjust position of rule-lines and conclusions

export function leftwidth(node: HTMLElement): [number, number] {
  const premiseNodes = Array.from(node.querySelectorAll<HTMLElement>(
    ":scope > .premises > .tree-node"
  ));

  const childConclusions: HTMLElement[] = [];
  for (const prem of premiseNodes) {
    const conc = prem.querySelector<HTMLElement>(":scope > input.conclusion-input");
    if (conc) childConclusions.push(conc);
  }

  let left = Infinity;
  let right = -Infinity;
  for (const c of childConclusions) {
    const cLeft = c.offsetLeft;
    const cRight = c.offsetLeft + c.offsetWidth;
    left = Math.min(left, cLeft);
    right = Math.max(right, cRight);
  }
  const width = right - left;

  return [left, width];
}

function nodesBottomUp(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(".tree-node")).reverse();
}

export function adjustAllRuleLines(): void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(".tree-node"));

  type Pending = { lineEl: HTMLElement | null; labelEl: HTMLElement | null };
  const pending: Pending[] = [];

  for (const node of nodes) {
    const [left, width] = leftwidth(node);
    if (!Number.isFinite(left) || !Number.isFinite(width)) continue; // leaf node

    const lineEl = node.querySelector<HTMLElement>(":scope > .rule-line > .line");
    if (lineEl) {
      lineEl.style.position = "absolute";
      lineEl.style.top = "";          // un-pin from any previous adjust run
      lineEl.style.left = `${left}px`;
      lineEl.style.width = `${width}px`;
    }

    const labelEl = node.querySelector<HTMLElement>(":scope > .rule-line > .rule-label");
    if (labelEl) {
      labelEl.style.position = "absolute";
      labelEl.style.left = `${left + width + 1}px`;
    }

    pending.push({ lineEl, labelEl });
  }

  for (const { lineEl, labelEl } of pending) {
    if (lineEl) {
      lineEl.style.top = `${lineEl.offsetTop}px`;
      lineEl.style.visibility = "visible";
    }
    if (labelEl) {
      labelEl.style.visibility = "visible";
    }
  }
}

function adjustAllConcl(): void {
  for (const node of nodesBottomUp()) {
    const concl = node.querySelector<HTMLElement>(":scope > .conclusion-input");
    if (!concl) continue;

    concl.style.left = "0px";

    const [left, width] = leftwidth(node);
    if (!Number.isFinite(left) || !Number.isFinite(width)) continue; // leaf: stays at 0

    const conclCenter = concl.offsetLeft + concl.offsetWidth / 2;
    const targetCenter = left + width / 2;
    concl.style.position = "relative";
    concl.style.left = `${Math.round(targetCenter - conclCenter)}px`;
  }
}

export function adjustAll(): void {
  adjustAllConcl();
  adjustAllRuleLines();
}