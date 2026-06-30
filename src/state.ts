import { getTransform, setTransform } from "./zoom";

type HistoryEntry = {
    tree: Derivation | undefined;
    transform: { scale: number; offsetX: number; offsetY: number };
    modifiedPath: number[] | null;
};

// see RawDerivation in the engine
export interface Derivation {
    rule: string | undefined;
    premises: Derivation[];
    conclusion: string | undefined;
}

const MAX_HISTORY = 100;

/* Tree paths */

export function findPath(root: Derivation, target: Derivation): number[] | null {
    if (root === target) return [];
    for (let i = 0; i < root.premises.length; i++) {
        const sub = findPath(root.premises[i]!, target);
        if (sub !== null) return [i, ...sub];
    }
    return null;
}

export function nodeAtPath(root: Derivation, path: number[]): Derivation | null {
    let cur: Derivation = root;
    for (const i of path) {
        const next = cur.premises[i];
        if (!next) return null;
        cur = next;
    }
    return cur;
}

/* App state */

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

    setSelected(node: Derivation | null) {
        this.selectedNode = node;
    }

    pushHistory(modifiedPath: number[] | null = null) {
        this.history.push({
            tree: this.derivation ? structuredClone(this.derivation) : undefined,
            transform: getTransform(),
            modifiedPath,
        });
        if (this.history.length > MAX_HISTORY) this.history.shift();
    }

    undo(): boolean {
        const entry = this.history.pop();
        if (!entry) return false;
        let carry = false;
        let carriedConclusion: Derivation["conclusion"] = undefined;
        if (entry.modifiedPath !== null && this.derivation) {
            const cur = nodeAtPath(this.derivation, entry.modifiedPath);
            if (cur) {
                carry = true;
                carriedConclusion = cur.conclusion;
            }
        }
        this.derivation = entry.tree!;
        this.selectedNode = null;

        if (this.derivation) {
            if (carry && entry.modifiedPath !== null) {
                const restored = nodeAtPath(this.derivation, entry.modifiedPath);
                if (restored) {
                    restored.conclusion = carriedConclusion;
                    this.selectedNode = restored;
                }
            }
            if (!this.selectedNode) this.selectedNode = this.derivation;
        }

        const t = entry.transform;
        setTransform(t.scale, t.offsetX, t.offsetY);
        return true;
    }
}
