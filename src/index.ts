import { AppState } from "./ui/state";
import { renderRuleList, renderTree, adjustAllRuleLines, attachKeyboardShortcuts } from "./ui/ui";
import { proofcheck } from "./logic/deduction-rules";
import { treeToCurryst, treeToBussproof } from "./export/convert";
import { getTransform, setTransform, fitTreeToViewport, centerTree } from "./ui/zoom";

import "../index.css";

export const appState = new AppState();

const transformLayer = document.getElementById("transformLayer")!;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isPanning = false;
let lastX = 0;
let lastY = 0;

function updateTransform() {
    transformLayer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

window.addEventListener("DOMContentLoaded", () => {
    renderRuleList(document.getElementById("rules")!);

    const premisesInput = document.getElementById("premises") as HTMLInputElement;
    const conclusionInput = document.getElementById("conclusion") as HTMLInputElement;

    attachKeyboardShortcuts(premisesInput);
    attachKeyboardShortcuts(conclusionInput);

    appState.root = null;
    appState.selectedNode = null;

    renderTree(document.getElementById("canvas")!);
    updateTransform()
    renderTree(document.getElementById("canvas")!);

    window.addEventListener("resize", () => {
        requestAnimationFrame(() => {
            adjustAllRuleLines();
            fitTreeToViewport();
        });
    });

    document.getElementById("undoBtn")!.onclick = () => {
        appState.undo();
        renderTree(document.getElementById("canvas")!, false);
    };

    document.getElementById("validateBtn")!.onclick = () => {
        const premInput = document.getElementById("premises") as HTMLInputElement;
        const conclInput = document.getElementById("conclusion") as HTMLInputElement;
        const resEl = document.getElementById("result");
        console.log(premInput.value, conclInput.value);

        const res = proofcheck(appState.root, premInput.value, conclInput.value);
        console.log("deductionnode:", appState.root);
        if (!resEl) return;

        if (res === true) resEl.textContent = "Correct proof";
        else if (res === false) resEl.textContent = "Incorrect proof";
        else resEl.textContent = "Syntax Error";
    };

    document.getElementById("practiceBtn")!.onclick = () => {
        // TODO: Picks a random instance of a dataset with premises and conclusions 
    }

    document.getElementById("clearTreeBtn")!.onclick = () => {
        appState.root = null;
        appState.selectedNode = null;
        appState.history = [];
        renderTree(document.getElementById("canvas")!);
        centerTree();
    }

    document.getElementById("clearInputBtn")!.onclick = () => {
        const premInput = document.getElementById("premises") as HTMLInputElement;
        const conclInput = document.getElementById("conclusion") as HTMLInputElement;
        const resEl = document.getElementById("result");

        premInput.value = "";
        conclInput.value = "";
        if (resEl) resEl.textContent = "No validation yet";
    }

    document.getElementById("convertTypBtn")!.onclick = async () => {
        if (!appState.root) {
            alert("No prooftree to export");
            return;
        }

        try {
            const typst = treeToCurryst(appState.root);
            await navigator.clipboard.writeText(typst);
            alert("Typst code copied to clipboard");
        } catch (e) {
            console.error(e);
            alert("Export faild");
        }
    };

    document.getElementById("convertTexBtn")!.onclick = async () => {
        if (!appState.root) {
            alert("No prooftree to export");
            return;
        }

        try {
            const latex = treeToBussproof(appState.root);
            await navigator.clipboard.writeText(latex);
            alert("Latex code copied to clipboard");
        } catch (e) {
            console.error(e);
            alert("Export faild")
        }
    }

    // Zoom and dragable
    const viewport = document.getElementById("proofViewport")!;


    viewport.addEventListener("wheel", (e) => {
        e.preventDefault();

        const rect = viewport.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const { scale, offsetX, offsetY } = getTransform();

        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const newScale = Math.min(3, Math.max(0.2, scale * zoomFactor));

        const nx = mx - ((mx - offsetX) / scale) * newScale;
        const ny = my - ((my - offsetY) / scale) * newScale;

        setTransform(newScale, nx, ny);
    }, { passive: false });

    viewport.addEventListener("mousedown", (e) => {
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isPanning) return;

        const { scale, offsetX, offsetY } = getTransform();
        setTransform(
            scale,
            offsetX + e.clientX - lastX,
            offsetY + e.clientY - lastY
        );

        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener("mouseup", () => isPanning = false);

    // Theme
    const toggle = document.getElementById("themeToggle")!;
        toggle.onclick = () => {
            const root = document.documentElement;
            const next =
                root.dataset.theme === "light" ? "dark" : "light";

            root.dataset.theme = next;
            localStorage.setItem("theme", next);
        };
    const saved = localStorage.getItem("theme");
        if (saved) {
            document.documentElement.dataset.theme = saved;
        }
});
