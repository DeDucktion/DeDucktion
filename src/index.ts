import { AppState } from "./state";
import { adjustAll, attachKeyboardShortcuts, renderRuleList, renderTree } from "./ui";
import { clampScale, fitAndCenter, getTransform, setTransform } from "./zoom";

import "../index.css";
import { ExportFormat, export_derivation, get_rules, type Rule, validate } from "engine";

export const appState = new AppState();
export const rules: Rule[] = get_rules();
const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
export function rule_map(id: string): Rule | undefined {
    return ruleById.get(id);
}

renderRuleList(document.getElementById("rules")!);

const premisesInput = document.getElementById("premises") as HTMLInputElement;
const conclusionInput = document.getElementById("conclusion") as HTMLInputElement;

attachKeyboardShortcuts(premisesInput);
attachKeyboardShortcuts(conclusionInput);

appState.derivation = null;
appState.selectedNode = null;

renderTree(document.getElementById("canvas")!);

let resizeRaf: number | null = null;
window.addEventListener("resize", () => {
    if (resizeRaf !== null) return;
    resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        adjustAll();
    });
});

//  Buttons

const resEl = document.getElementById("result")!;
const setResult = (text: string, kind: "ok" | "err" | "ghost") => {
    resEl.textContent = text;
    resEl.className = kind;
};

document.getElementById("undoBtn")!.onclick = () => {
    if (!appState.undo()) return;
    renderTree(document.getElementById("canvas")!);
};

document.getElementById("validateBtn")!.onclick = () => {
    const premises = document.getElementById("premises") as HTMLInputElement;
    const conclusion = document.getElementById("conclusion") as HTMLInputElement;
    const resEl = document.getElementById("result")!;

    let res = false;

    if (appState.derivation) {
        try {
            validate(appState.derivation, premises.value, conclusion.value);
            res = true;
        } catch {
            res = false;
        }
    }

    if (res === true) resEl.textContent = "Correct proof";
    else if (res === false) resEl.textContent = "Incorrect proof";
    else resEl.textContent = "Syntax Error";
};

document.getElementById("practiceBtn")!.onclick = () => {
    // TODO: Picks a random instance of a dataset with premises and conclusions
};

document.getElementById("clearTreeBtn")!.onclick = () => {
    appState.pushHistory();
    appState.derivation = null;
    appState.selectedNode = null;
    renderTree(document.getElementById("canvas")!);
    setTransform(1, 0, 0);
    setResult("No validation yet.", "ghost");
};

document.getElementById("clearInputBtn")!.onclick = () => {
    premisesInput.value = "";
    conclusionInput.value = "";
    setResult("No validation yet.", "ghost");
};

document.getElementById("fitBtn")!.onclick = () => fitAndCenter();

document.getElementById("convertTypBtn")!.onclick = async () => {
    try {
        const typst = export_derivation(appState.derivation, ExportFormat.Typst);
        await navigator.clipboard.writeText(typst);
        alert("Typst code copied to clipboard");
    } catch (e) {
        console.error(e);
        alert("Export failed");
    }
};

document.getElementById("convertTexBtn")!.onclick = async () => {
    try {
        const latex = export_derivation(appState.derivation, ExportFormat.Latex);
        await navigator.clipboard.writeText(latex);
        alert("LaTeX code copied to clipboard");
    } catch (e) {
        console.error(e);
        alert("Export failed");
    }
};

// Zoom & Pan

const viewport = document.getElementById("proofViewport")!;

const isInteractive = (t: EventTarget | null) =>
    t instanceof HTMLElement && !!t.closest("input, button, a, select, textarea");

viewport.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();

        const rect = viewport.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const { scale, offsetX, offsetY } = getTransform();

        const zoomFactor = Math.exp(-e.deltaY * 0.0015);
        const newScale = clampScale(scale * zoomFactor);

        const nx = mx - ((mx - offsetX) / scale) * newScale;
        const ny = my - ((my - offsetY) / scale) * newScale;

        setTransform(newScale, nx, ny);
    },
    { passive: false },
);

let isPanning = false;
let lastX = 0;
let lastY = 0;

viewport.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (isInteractive(e.target)) return;
    isPanning = true;
    lastX = e.clientX;
    lastY = e.clientY;
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add("panning");
});

viewport.addEventListener("pointermove", (e) => {
    if (!isPanning) return;
    const { scale, offsetX, offsetY } = getTransform();
    setTransform(scale, offsetX + e.clientX - lastX, offsetY + e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;
});

const endPan = (e: PointerEvent) => {
    if (!isPanning) return;
    isPanning = false;
    viewport.classList.remove("panning");
    if (viewport.hasPointerCapture(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId);
    }
};
viewport.addEventListener("pointerup", endPan);
viewport.addEventListener("pointercancel", endPan);

viewport.addEventListener("dblclick", (e) => {
    if (isInteractive(e.target)) return;
    fitAndCenter();
});

// Theme

const toggle = document.getElementById("themeToggle")!;
const setThemeIcon = (theme: string) => {
    toggle.textContent = theme === "light" ? "🌙" : "☀️";
};

const saved = localStorage.getItem("theme");
const initialTheme = saved === "dark" ? "dark" : "light"; // default light
document.documentElement.dataset.theme = initialTheme;
setThemeIcon(initialTheme);

toggle.onclick = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
    setThemeIcon(next);
};

async function copyText(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }
    
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (!ok) throw new Error("execCommand copy failed");
}

function initCopyButtons(): void {
    document.querySelectorAll<HTMLButtonElement>(".copy-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const text = btn.dataset.copy ?? "";
            const original = btn.textContent;
            try {
                await copyText(text);
                btn.textContent = "Copied!";
                btn.classList.add("copied");
            } catch (err) {
                console.error("Kopieren fehlgeschlagen:", err);
                btn.textContent = "Error!";
            }
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove("copied");
            }, 2000);
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCopyButtons);
} else {
    initCopyButtons();
}
