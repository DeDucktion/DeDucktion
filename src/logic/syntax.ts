// Syntax

export type Term =
    | { kind: "var", name: string }
    | { kind: "const"; name: string };

export type Formula =
    | { kind: "atom"; pred: string; args: Term[] }
    | { kind: "falsum" }
    | { kind: "not"; sub: Formula }
    | { kind: "and"; left: Formula; right: Formula }
    | { kind: "or"; left: Formula; right: Formula }
    | { kind: "cond"; left: Formula; right: Formula }
    | { kind: "forall"; v: string; body: Formula }
    | { kind: "exists"; v: string; body: Formula };

// Def of Deduction Node
export interface DeductionNode {
    rule: string | null;
    premises: DeductionNode[];
    conclusion: Formula | null;
    assumption?: boolean;
}

export function tokenize(expr: string): string[] | null {
    const tokenPatterns = [
        "→",
        "¬",
        "∧",
        "∨",
        "⊥",
        "\\(",
        "\\)",
        "(?:A|E)",
        "[BCDEFGHIJKLMNOPQRSTUVWXYZ](?:_\\d+)?(?:\\^\\d+)?(?:[xyz](?:_\\d+)?)+",
        "[BCDEFGHIJKLMNOPQRSTUVWXYZ](?:_\\d+)?(?:\\^\\d+)?",
        "[xyz](?:_\\d+)?",
        "\\s+"
    ];

    const combined = tokenPatterns.join("|");
    const regex = new RegExp(combined, "g");

    const tokens: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(expr)) !== null) {
        const tok = match[0];
        if (!tok.match(/^\s+$/)) {
            tokens.push(tok);
        }
    }
    const joinedTokens = tokens.join("");
    const cleanedInput = expr.replace(/\s+/g, "");
    if (joinedTokens !== cleanedInput) {
        return null;
    }
    ///console.log("tokens", tokens);
    return tokens;
}

export function parseFormula(input: string): Formula | null {
    const tokens = tokenize(input);
    if (!tokens) return null;

    if (tokens.length === 1 && tokens[0] === "⊥") {
        return { kind: "falsum" };
    }

    const atom = parseAtom(tokens);
    if (atom && atom.rest.length === 0) return atom.formula;

    if (tokens[0] === "¬") {
        const sub = parseFormula(tokens.slice(1).join(""));
        return sub ? { kind: "not", sub } : null;
    }

    if ((tokens[0] === "A" || tokens[0] === "E") && tokens[1]) {
        const body = parseFormula(tokens.slice(2).join(""));
        if (!body) return null;
        return tokens[0] === "A"
            ? { kind: "forall", v: tokens[1], body }
            : { kind: "exists", v: tokens[1], body };
    }

    if (tokens[0] === "(" && tokens[tokens.length - 1] === ")") {
        let depth = 0;
        for (let i = 1; i < tokens.length; i++) {
            const t = tokens[i]!;
            if (t === "(") depth++;
            if (t === ")") depth--;
            if (depth === 0 && ["∧", "∨", "→"].includes(t)) {
                const left = parseFormula(tokens.slice(1, i).join(""));
                const right = parseFormula(tokens.slice(i + 1, -1).join(""));
                if (!left || !right) return null;

                return t === "∧"
                    ? { kind: "and", left, right }
                    : t === "∨"
                        ? { kind: "or", left, right }
                        : { kind: "cond", left, right }
            }
        }
    }

    return null;
}

function parseAtom(tokens: string[]) {
    const predRegex = /^([A-Z])(_\d+)?(\^(\d+))?/;
    const varRegex = /^[xyz](?:_\d+)?$/;

    const m = predRegex.exec(tokens[0]!);
    if (!m) return null;

    const pred = m[0];
    const arity = m[4] ? parseInt(m[4]) : 0;

    const args: Term[] = [];
    let i = 1;

    for (let k = 0; k < arity; k++) {
        if (!tokens[i] || !varRegex.test(tokens[i]!)) return null;
        args.push({ kind: "var", name: tokens[i]! });
        i++;
    }

    if (tokens[i] && varRegex.test(tokens[i]!)) return null;

    return {
        formula: { kind: "atom", pred, args } as const,
        rest: tokens.slice(i)
    };
}

export function FormulatoString(f: Formula): string {
    switch (f.kind) {
        case "atom":
            return f.pred + f.args.map(a => a.name).join("");
        case "falsum":
            return "⊥";
        case "not":
            return "¬" + FormulatoString(f.sub);
        case "and":
            return `(${FormulatoString(f.left)}∧${FormulatoString(f.right)})`;
        case "or":
            return `(${FormulatoString(f.left)}∨${FormulatoString(f.right)})`;
        case "cond":
            return `(${FormulatoString(f.left)}→${FormulatoString(f.right)})`;
        case "forall":
            return `A${f.v}${FormulatoString(f.body)}`;
        case "exists":
            return `E${f.v}${FormulatoString(f.body)}`;
    }
}

export function equal(a: Formula, b: Formula): boolean {
    if (a.kind !== b.kind) return false;

    switch (a.kind) {
        case "atom":
            return (
                b.kind === "atom" &&
                a.pred === b.pred &&
                a.args.length === b.args.length &&
                a.args.every((t, i) => t.name === b.args[i]!.name)
            );

        case "falsum":
            return b.kind === "falsum";

        case "not":
            return b.kind === "not" && equal(a.sub, b.sub);

        case "and":
            return (
                b.kind === "and" &&
                equal(a.left, b.left) &&
                equal(a.right, b.right)
            );
        case "or":
            return (
                b.kind === "or" &&
                equal(a.left, b.left) &&
                equal(a.right, b.right)
            );
        case "cond":
            return (
                b.kind === "cond" &&
                equal(a.left, b.left) &&
                equal(a.right, b.right)
            );
    }
    return false;
}
