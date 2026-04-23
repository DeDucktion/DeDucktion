// Deduction rules

export interface DeductionRule {
    name: string;
    arity: number;
    label: string;
}

export const Rules: DeductionRule[] = [
    {
        name: "and-intro",
        arity: 2,
        label: "∧I",
    },
    {
        name: "and-eli1",
        arity: 1,
        label: "∧E1",
    },
    {
        name: "and-eli2",
        arity: 1,
        label: "∧E2",
    },
    {
        name: "or-intro1",
        arity: 1,
        label: "∨I1",
    },
    {
        name: "or-intro2",
        arity: 1,
        label: "∨I2",
    },
    {
        name: "or-eli",
        arity: 3,
        label: "∨E",
    },
    {
        name: "cond-intro",
        arity: 1,
        label: "→I",
    },
    {
        name: "cond-eli",
        arity: 2,
        label: "→E",
    },
    {
        name: "neg-intro",
        arity: 2,
        label: "¬I",
    },
    {
        name: "neg-eli",
        arity: 2,
        label: "¬E",
    },
];

const RuleMap = new Map(Rules.map((r) => [r.name, r]));

export function getRule(name: string): DeductionRule | undefined {
    return RuleMap.get(name);
}
