import type {DeductionNode} from "../logic/syntax.ts";

export class AppState {
    root: DeductionNode | null = null;
    selectedNode: DeductionNode | null = null;
    history: DeductionNode[] = [];

    constructor(){}

    createNode(ruleName: string, arity: number): DeductionNode {
        const node: DeductionNode = {
            rule: ruleName,
            premises: Array.from({length:arity}, () => this.emptyNode()),
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

    setSelected(node: DeductionNode){
        this.selectedNode = node;
    }

    pushHistory(){
        if (this.root) {
            this.history.push(structuredClone(this.root));
        }
    }

    undo(){
        if(this.history.length>0){
            this.root = this.history.pop() || null;
        }
    }
}