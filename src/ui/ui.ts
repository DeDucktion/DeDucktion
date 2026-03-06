import { Rules, getRule } from "../logic/deduction-rules.ts";
import { appState } from "../main.ts";
import type { DeductionNode } from "../logic/syntax.ts";
import { parseFormula, FormulatoString } from "../logic/syntax.ts";
import { fitTreeToViewport,  centerTree } from "./zoom.ts";

export function renderRuleList(container: HTMLElement) {
  container.innerHTML = "";
  for (const rule of Rules) {
    const btn = document.createElement("button");
    btn.textContent = rule.label;
    btn.onclick = () => {
      appState.pushHistory();
      const newNode = appState.createNode(rule.name, rule.arity);
      if (!appState.selectedNode) {
        appState.root = newNode;
        appState.selectedNode = newNode;
      } else {
        Object.assign(appState.selectedNode, newNode);
      }
      renderTree(document.getElementById("canvas")!);
    };
    container.appendChild(btn);
  }
}

export function attachKeyboardShortcuts(input: HTMLInputElement) {
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
    "to": "→",
    "bot": "⊥",
    "falsum": "⊥",
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
        break;
      }
    }
  });
}
let firstcenter = false;
export function renderTree(container: HTMLElement, doFit = true) {
  container.innerHTML = "";
  if (!appState.root) return;
  const node = renderNode(appState.root);
  container.appendChild(node);
  requestAnimationFrame(() => {
    adjustAllRuleLines();
    if(doFit){
      fitTreeToViewport();
    }
    if(!firstcenter){
      centerTree();
      firstcenter = true;
    }
  });
}


function renderNode(node: DeductionNode): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "tree-node";

  // Premises
  const premisesContainer = document.createElement("div");
  premisesContainer.className = "premises";
  for (const p of node.premises) {
    const premEl = renderNode(p);
    const premInput = premEl.querySelector<HTMLInputElement>("input.conclusion-input");
    if (premInput) attachKeyboardShortcuts(premInput);
    premisesContainer.appendChild(premEl);
  }

  wrapper.appendChild(premisesContainer);

  // Rule-line
  const ruleLine = document.createElement("div");
  ruleLine.className = node.rule ? "rule-line" : "rule-line hidden";
  const line = document.createElement("div");
  line.className = "line";
  const label = document.createElement("span");
  label.className = "rule-label";
  if (node.rule) {
    console.log(Rules);
    label.textContent = getRule(node.rule) ? getRule(node.rule)!.label : node.rule;
    ruleLine.appendChild(line);
    ruleLine.appendChild(label);
  }

  wrapper.appendChild(ruleLine);

  // Conclusion
  const conclusion = document.createElement("input");
  conclusion.className = "conclusion-input";
  conclusion.value = node.conclusion ? FormulatoString(node.conclusion) : "";
  conclusion.oninput = () => {
    const parsed = parseFormula(conclusion.value);
    node.conclusion = parsed;
  };
  attachKeyboardShortcuts(conclusion);
  wrapper.appendChild(conclusion);

  wrapper.onclick = (e) => { e.stopPropagation(); appState.setSelected(node); };

  return wrapper;
}


export function adjustAllRuleLines(): void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(".tree-node"));

  for (const node of nodes) {
    const premiseNodes = Array.from(node.querySelectorAll<HTMLElement>(
      ":scope > .premises > .tree-node"
    ));

    if (premiseNodes.length === 0) continue;

    const childConclusions: HTMLElement[] = [];
    for (const prem of premiseNodes) {
      const conc = prem.querySelector<HTMLElement>(":scope > input.conclusion-input");
      if (conc) childConclusions.push(conc);
    }
    if (childConclusions.length === 0) continue;

    let left = Infinity;
    let right = -Infinity;
    for (const c of childConclusions) {
      const cLeft = c.offsetLeft;
      const cRight = c.offsetLeft + c.offsetWidth;
      left = Math.min(left, cLeft);
      right = Math.max(right, cRight);
    }
    const width = right - left;

    // Linie 
    const lineEl = node.querySelector<HTMLElement>(":scope > .rule-line > .line");
    if (lineEl) {
      lineEl.style.position = "absolute";
      lineEl.style.left = `${left}px`;
      lineEl.style.width = `${width}px`;
      
      
    }

    // Rule-label
    const ruleLabel = node.querySelector<HTMLElement>(":scope > .rule-line > .rule-label");
    if (ruleLabel) {
      ruleLabel.style.position = "absolute";
      ruleLabel.style.left = `${left + width + 1}px`;

    }

    // Conclusioninput
    const concl = node.querySelector<HTMLElement>(":scope > .conclusion-input");
    if (concl) {
      const concCenter = concl.offsetLeft + concl.offsetWidth / 2;
      const targetCenter = left + width / 2;
      concl.style.position = "relative";
      concl.style.left = `${targetCenter - concCenter}px`;
    }
  }
}