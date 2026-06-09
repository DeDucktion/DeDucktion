// Deduction rules

export interface DeductionRule {
    name: string;
    arity: number;
    label: string;
}

export const Rules: DeductionRule[] = [
    {
        name: "nd.and.intro",
        arity: 2,
        label: "∧I",
    },
    {
        name: "nd.and.elim.1",
        arity: 1,
        label: "∧E1",
    },
    {
        name: "nd.and.elim.2",
        arity: 1,
        label: "∧E2",
    },
    {
        name: "nd.or.intro.1",
        arity: 1,
        label: "∨I1",
    },
    {
        name: "nd.or.intro.2",
        arity: 1,
        label: "∨I2",
    },
    {
        name: "nd.or.elim",
        arity: 3,
        label: "∨E",
    },
    {
        name: "nd.imp.intro",
        arity: 1,
        label: "→I",
    },
    {
        name: "nd.imp.elim",
        arity: 2,
        label: "→E",
    },
    {
        name: "nd.neg.intro",
        arity: 2,
        label: "¬I",
    },
    {
        name: "nd.neg.elim",
        arity: 2,
        label: "¬E",
    },
];

const RuleMap = new Map(Rules.map((r) => [r.name, r]));

export function getRule(name: string): DeductionRule | undefined {
    return RuleMap.get(name);
}
