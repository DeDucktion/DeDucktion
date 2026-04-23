import { getTransform, setTransform } from "./zoom";

type HistoryEntry = {
    tree: DeductionNode;
    transform: { scale: number; offsetX: number; offsetY: number };
};

export interface DeductionNode {
    rule: string | undefined;
    premises: DeductionNode[];
    conclusion: string | undefined;
}

export class AppState {
    root: DeductionNode | null = null;
    selectedNode: DeductionNode | null = null;
    history: HistoryEntry[] = [];

    createNode(ruleName: string, arity: number): DeductionNode {
        const node: DeductionNode = {
            rule: ruleName,
            premises: Array.from({ length: arity }, () => this.emptyNode()),
            conclusion: undefined,
        };
        return node;
    }

    emptyNode(): DeductionNode {
        return {
            rule: undefined,
            premises: [],
            conclusion: undefined,
        };
    }

    setSelected(node: DeductionNode) {
        this.selectedNode = node;
    }

    pushHistory() {
        if (this.root) {
            this.history.push({
                tree: structuredClone(this.root),
                transform: getTransform(),
            });
        }
    }

    undo() {
        const entry = this.history.pop();
        if (!entry) return;

        this.root = entry.tree;
        setTransform(entry.transform.scale, entry.transform.offsetX, entry.transform.offsetY);
    }
}
