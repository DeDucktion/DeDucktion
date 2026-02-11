import type { DeductionNode } from "../logic/syntax.ts";
import { getTransform, setTransform } from "./zoom.ts";

type HistoryEntry = {
    tree: DeductionNode;
    transform: { scale: number; offsetX: number; offsetY: number }
};

export class AppState {
    root: DeductionNode | null = null;
    selectedNode: DeductionNode | null = null;
    history: HistoryEntry[] = [];

    constructor() { }

    createNode(ruleName: string, arity: number): DeductionNode {
        const node: DeductionNode = {
            rule: ruleName,
            premises: Array.from({ length: arity }, () => this.emptyNode()),
            conclusion: null
        };
        return node;
    }

    emptyNode(): DeductionNode {
        return {
            rule: null,
            premises: [],
            conclusion: null
        };
    }

    setSelected(node: DeductionNode) {
        this.selectedNode = node;
    }

    pushHistory() {
        if (this.root) {
            this.history.push({
                tree: structuredClone(this.root),
                transform: getTransform()
            });
        }
    }

    undo() {
        const entry = this.history.pop();
        if (!entry) return;

        this.root = entry.tree;
        setTransform(
            entry.transform.scale,
            entry.transform.offsetX,
            entry.transform.offsetY
        );
    }
}