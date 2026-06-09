import { getTransform, setTransform } from "./zoom";

type HistoryEntry = {
    tree: Derivation;
    transform: { scale: number; offsetX: number; offsetY: number };
};

// see RawDerivation in the engine
export interface Derivation {
    rule: string | undefined;
    premises: Derivation[];
    conclusion: string | undefined;
}

export class AppState {
    derivation: Derivation | null = null;
    selectedNode: Derivation | null = null;
    history: HistoryEntry[] = [];

    createNode(ruleName: string, arity: number): Derivation {
        const node: Derivation = {
            rule: ruleName,
            premises: Array.from({ length: arity }, () => this.emptyNode()),
            conclusion: undefined,
        };
        return node;
    }

    emptyNode(): Derivation {
        return {
            rule: undefined,
            premises: [],
            conclusion: undefined,
        };
    }

    setSelected(node: Derivation) {
        this.selectedNode = node;
    }

    pushHistory() {
        if (this.derivation) {
            this.history.push({
                tree: structuredClone(this.derivation),
                transform: getTransform(),
            });
        }
    }

    undo() {
        const entry = this.history.pop();
        if (!entry) return;

        this.derivation = entry.tree;
        setTransform(entry.transform.scale, entry.transform.offsetX, entry.transform.offsetY);
    }
}
