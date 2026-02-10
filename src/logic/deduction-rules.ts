import type { DeductionNode, Formula } from "./syntax.ts";
import { parseFormula, equal } from "./syntax.ts";

// Deduction-Rules

export interface DeductionRule {
    name: string;
    arity: number;
    label: string;
    latexlabel: string,
    typstlabel: string,
    check: RuleCheck;
}

type RuleCheck = (p: Formula[], c: Formula) => boolean;

export const Rules: DeductionRule[] = [
    {
        name: "and-intro",
        arity: 2,
        label: "∧I",
        latexlabel: "\\land I",
        typstlabel: "and I",
        check: (p, C) => {
            const [A, B] = p;
            return (
                C.kind === "and" &&
                equal(C.left, A!) &&
                equal(C.right, B!)
            );
        }
    },
    {
        name: "and-eli1",
        arity: 1,
        label: "∧E1",
        latexlabel: "\\land E1",
        typstlabel: "and E 1",
        check: (P, c) => {
            const [L] = P;
            return (
                L!.kind === "and" &&
                equal(L!.left, c)
            )
        }
    },
    {
        name: "and-eli2",
        arity: 1,
        label: "∧E2",
        latexlabel: "\\land E2",
        typstlabel: "and E 2",
        check: (P, c) => {
            const [L] = P;
            return (
                L!.kind === "and" &&
                equal(L!.right, c)
            )
        }
    },
    {
        name: "or-intro1",
        arity: 1,
        label: "∨I1",
        latexlabel: "\\lor I1",
        typstlabel: "or I 1",
        check: (P, c) => {
            const [L] = P;
            return (
                c.kind === "or" &&
                equal(c.left, L!)
            )
        }
    },
    {
        name: "or-intro2",
        arity: 1,
        label: "∨I2",
        latexlabel: "\\lor I2",
        typstlabel: "or I 2",
        check: (P, c) => {
            const [L] = P;
            return (
                c.kind === "or" &&
                equal(c.right, L!)
            )
        }
    },
    {
        name: "or-eli",
        arity: 3,
        label: "∨E",
        latexlabel: "\\lor E",
        typstlabel: "or E",
        check: (P, c) => {
            const [A, B, C] = P;
            return (
                A!.kind === "or" &&
                equal(B!, c) &&
                equal(C!, c)
            )
        }
    },
    {
        name: "cond-intro",
        arity: 1,
        label: "→I",
        latexlabel: "\\to I",
        typstlabel: "-> I",
        check: (P, c) => {
            const [A] = P;
            return (
                c.kind === "cond" &&
                equal(c.right, A!)
            )
        }
    },
    {
        name: "cond-eli",
        arity: 2,
        label: "→E",
        latexlabel: "\\to E",
        typstlabel: "-> E",
        check: (P, c) => {
            const [A, B] = P;
            return (
                A!.kind === "cond" &&
                equal(A!.left, B!) &&
                equal(A!.right, c)
            )
        }
    },
    {
        name: "neg-intro",
        arity: 2,
        label: "¬I",
        latexlabel: "\\lnot I",
        typstlabel: "not I",
        check: (P, c) => {
            const [A, B] = P;
            return (
                c.kind === "not" &&
                ((A!.kind === "not" &&
                    equal(A!.sub, B!)
                ) || (B!.kind === "not" &&
                    equal(B!.sub, A!)
                    ))
            )
        }
    },
    {
        name: "neg-eli",
        arity: 2,
        label: "¬E",
        latexlabel: "\\lnot E",
        typstlabel: "not E",
        check: (P, c) => {
            const [A, B] = P;
            return (
                (A!.kind === "not" &&
                    equal(A!.sub, B!)
                ) || (B!.kind === "not" &&
                    equal(B!.sub, A!)
                )
            )
        }
    }
]

const RuleMap = new Map(Rules.map(r => [r.name, r]));

export function getRule(name: string): DeductionRule | undefined {
    return RuleMap.get(name);
}

export function validate(node: DeductionNode): boolean | null {
    if (!node.rule || !node.conclusion) return null;

    const rule = node.rule ? getRule(node.rule) : undefined;
    
    if (!rule) return null;

    if (node.premises.length !== rule.arity) return false;

    const premises = node.premises.map(p => p.conclusion);
    if (premises.some(p => p == null)) return null;

    return rule.check(premises as Formula[], node.conclusion);
}

type Context = Formula[];

export function validateTree(node: DeductionNode, context: Context): boolean | null {
    if (!node.rule) {
        if (!node.conclusion) return null;
        return context.some(f => equal(f, node.conclusion!))
    }

    if (!node.conclusion) return null;

    let nextContext = context;
    if (node.rule === "cond-intro") {
        if (node.conclusion.kind !== "cond") return false;
        nextContext = [...context, node.conclusion.left];
    }

    if (node.rule === "neg-intro") {
        if (node.conclusion.kind !== "not") return false;
        nextContext = [...context, node.conclusion.sub];
    }

    if (node.rule === "neg-eli") {
        if (!node.conclusion) return null;
        nextContext = [...context, { kind: "not", sub: node.conclusion }]
    }

    if (node.rule === "or-eli") {
        if (node.premises.length !== 3) return false;

        const disj = node.premises[0]?.conclusion;
        if (!disj || disj.kind !== "or") return false;

        const leftCtx = [...context, disj.left];
        const rightCtx = [...context, disj.right];

        const r0 = validateTree(node.premises[0]!, context);
        if (r0 !== true) return r0;

        const r1 = validateTree(node.premises[1]!, leftCtx);
        if (r1 !== true) return r1;

        const r2 = validateTree(node.premises[2]!, rightCtx);
        if (r2 !== true) return r2;

        return validate(node);
    }

    for (const p of node.premises) {
        const res = validateTree(p, nextContext);
        if (res !== true) return res;
    }

    return validate(node);
}

export function parsePremises(input: string): Formula[] | null {
    if (input.trim() === "") return [];

    const parts = input.split(",");
    const formulas: Formula[] = [];

    for (const p of parts) {
        const f = parseFormula(p.trim());
        if (!f) return null;
        formulas.push(f);
    }
    return formulas;
}

export function parseConclusion(input: string): Formula | null {
    return parseFormula(input.trim());
}

export function proofcheck(root: DeductionNode | null, premisesInput: string, conclusionInput: string): boolean | null {
    if (!root) return null;

    const premises = parsePremises(premisesInput);
    if (!premises) return null;

    const concl = parseConclusion(conclusionInput);
    if (!concl) return null;

    const val = validateTree(root, premises);
    if (val !== true) return val;

    if (!root.conclusion) return null;
    if (!equal(root.conclusion, concl)) return false;

    return true;
}    