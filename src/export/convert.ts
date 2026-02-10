import type { Formula, DeductionNode } from "../logic/syntax.ts";
import { getRule } from "../logic/deduction-rules.ts";

/// Typst

export function formulaToTypst(f: Formula): string {
    switch (f.kind) {
        case "atom":
            return f.pred;
        case "not":
            return `not ${formulaToTypst(f.sub)}`;
        case "and":
            return `(${formulaToTypst(f.left)} and ${formulaToTypst(f.right)})`;
        case "or":
            return `(${formulaToTypst(f.left)} or ${formulaToTypst(f.right)})`;
        case "cond":
            return `(${formulaToTypst(f.left)} -> ${formulaToTypst(f.right)})`;
    }
    return "";
}

export function nodeToCurryst(node: DeductionNode): string {
    if (!node.conclusion) {
        throw new Error("Node without conclusion cannot be exported");
    }

    const concl = `$${formulaToTypst(node.conclusion)}$`;

    if (!node.rule) {
        return concl;
    }

    const rule = getRule(node.rule);
    if (!rule) {
        throw new Error(`Unknown rule: ${node.rule}`);
    }

    const premises = node.premises.map(p => nodeToCurryst(p));

    return `rule(
    name: $${rule.typstlabel}$,
    ${premises.join(",\n")},
    ${concl}
    )`;
}

export function treeToCurryst(root: DeductionNode): string {
    return `#prooftree(
    ${nodeToCurryst(root)}
    )`;
}

/// LaTex

export function formulaToLaTex(f: Formula): string {
    switch (f.kind) {
        case "atom":
            return f.pred;
        case "not":
            return `\\lnot ${formulaToLaTex(f.sub)}`;
        case "and":
            return `(${formulaToLaTex(f.left)} \\land ${formulaToLaTex(f.right)})`
        case "or":
            return `(${formulaToLaTex(f.left)} \\lor ${formulaToLaTex(f.right)})`
        case "cond":
            return `(${formulaToLaTex(f.left)} \\to ${formulaToLaTex(f.right)})`
    }
    return "";
}

function infCommand(arity: number): string {
    switch (arity) {
        case 0: return "";
        case 1: return "\\UnaryInfC";
        case 2: return "\\BinaryInfC";
        case 3: return "\\TrinaryInfC";
        default:
            throw new Error(`Unsupported arity: ${arity}`);
    }
}

export function nodeToBussproof(node: DeductionNode): string {
    if (!node.conclusion) {
        throw new Error("Node without conclusion cannot be exported")
    }

    const concl = `$${formulaToLaTex(node.conclusion)}$`;

    if (!node.rule) {
        return `\\AxiomC{${concl}}`;
    }

    const rule = getRule(node.rule);
    if (!rule) {
        throw new Error("Unknown rule");
    }

    const parts: string[] = [];

    for (const p of node.premises) {
        parts.push(nodeToBussproof(p));
    }

    parts.push(`\\RightLabel{$${rule.latexlabel}$}`);

    parts.push(`${infCommand(rule.arity)}{${concl}}`);

    return parts.join("\n");
}

export function treeToBussproof(root: DeductionNode): string {
    return `
    \\begin{prooftree}
    ${nodeToBussproof(root)}
    \\end{prooftree}
    `.trim();
}
