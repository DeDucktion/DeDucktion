export type PracticeCategory = "conjunction" | "implication" | "disjunction" | "negation" | "mixed";

export interface PracticeProblem {
    id: string;
    category: PracticeCategory;
    group?: string;
    premises: string[];
    conclusion: string;
    steps?: number;
}

/* Problems from The Natural Deduction Pack by Alastair Carr https://users.ox.ac.uk/~logicman/carr/NDpack.pdf */

export const PracticeProblems: PracticeProblem[] = [
    /* ============================ 4.2 Conjunction ============================ */
    { id: "conj-1", category: "conjunction", premises: ["P", "Q"], conclusion: "(P∧Q)", steps: 1 },
    {
        id: "conj-2",
        category: "conjunction",
        premises: ["((P1∧P2)∧P3)"],
        conclusion: "P2",
        steps: 2,
    },
    { id: "conj-3", category: "conjunction", premises: ["(P∧Q)"], conclusion: "(Q∧P)", steps: 3 },
    {
        id: "conj-4",
        category: "conjunction",
        premises: ["(Q∧P)", "R"],
        conclusion: "(P∧(R∧Q))",
        steps: 4,
    },
    {
        id: "conj-5",
        category: "conjunction",
        premises: ["(P1∧P2)", "((Q1∧Q2)∧R)"],
        conclusion: "((P1∧Q2)∧R)",
        steps: 6,
    },
    {
        id: "conj-6",
        category: "conjunction",
        premises: ["(P∧(Q∧R))"],
        conclusion: "((R∧P)∧Q)",
        steps: 7,
    },

    /* ============================ 4.3 Implication =========================== */
    { id: "impl-1", category: "implication", premises: [], conclusion: "(P→P)", steps: 1 },
    { id: "impl-2", category: "implication", premises: [], conclusion: "(P→(Q→P))", steps: 2 },
    {
        id: "impl-3",
        category: "implication",
        premises: ["(P→Q)", "(Q→R)"],
        conclusion: "(P→R)",
        steps: 3,
    },
    { id: "impl-4", category: "implication", premises: [], conclusion: "(P→((P→Q)→Q))", steps: 3 },
    {
        id: "impl-5",
        category: "implication",
        premises: ["((P→Q)→(P→R))"],
        conclusion: "(Q→(P→R))",
        steps: 3,
    },
    {
        id: "impl-6",
        category: "implication",
        premises: ["((P→Q)→P)"],
        conclusion: "(Q→P)",
        steps: 3,
    },
    {
        id: "impl-7",
        category: "implication",
        premises: ["(P→(Q→R))"],
        conclusion: "(Q→(P→R))",
        steps: 4,
    },
    {
        id: "impl-8",
        category: "implication",
        premises: ["(P→(Q→R))", "(P→Q)"],
        conclusion: "(P→R)",
        steps: 4,
    },
    {
        id: "impl-9",
        category: "implication",
        premises: ["((P→P)→Q)"],
        conclusion: "((Q→R)→R)",
        steps: 4,
    },
    {
        id: "impl-10",
        category: "implication",
        premises: [],
        conclusion: "((P→(Q→R))→((P→Q)→(P→R)))",
        steps: 6,
    },
    {
        id: "impl-11",
        category: "implication",
        group: "mixed with conjunction",
        premises: ["(P∧Q)"],
        conclusion: "(P→Q)",
        steps: 2,
    },
    {
        id: "impl-12",
        category: "implication",
        group: "mixed with conjunction",
        premises: [],
        conclusion: "((P∧Q)→P)",
        steps: 2,
    },
    {
        id: "impl-13",
        category: "implication",
        group: "mixed with conjunction",
        premises: ["(P→(Q∧R))"],
        conclusion: "(P→Q)",
        steps: 3,
    },
    {
        id: "impl-14",
        category: "implication",
        group: "mixed with conjunction",
        premises: ["(((P∧Q)→Q)→(Q→P))"],
        conclusion: "(Q→P)",
        steps: 3,
    },
    {
        id: "impl-15",
        category: "implication",
        group: "mixed with conjunction",
        premises: ["((P∧Q)→R)"],
        conclusion: "(P→(Q→R))",
        steps: 4,
    },
    {
        id: "impl-16",
        category: "implication",
        group: "mixed with conjunction",
        premises: ["((P→Q)∧(P→R))"],
        conclusion: "(P→(Q∧R))",
        steps: 6,
    },
    {
        id: "impl-17",
        category: "implication",
        group: "mixed with conjunction",
        premises: ["(P→(Q∧R))"],
        conclusion: "((P→Q)∧(P→R))",
        steps: 7,
    },
    {
        id: "impl-bonus",
        category: "implication",
        group: "bonus (≤ 8 steps)",
        premises: ["((((P1∧P2)∧P3)∧P4)∧P5)"],
        conclusion: "(P1∧P1)",
        steps: 8,
    },

    /* ============================ 4.4 Disjunction =========================== */
    { id: "disj-1", category: "disjunction", premises: ["(P∨Q)"], conclusion: "(Q∨P)", steps: 3 },
    {
        id: "disj-2",
        category: "disjunction",
        premises: ["(P∨Q)"],
        conclusion: "(P∨(Q∨R))",
        steps: 4,
    },
    {
        id: "disj-3",
        category: "disjunction",
        premises: ["((P∨Q)∨R)"],
        conclusion: "(P∨(Q∨R))",
        steps: 7,
    },
    {
        id: "disj-4",
        category: "disjunction",
        premises: ["((P∨Q)∨(R∨P1))"],
        conclusion: "((P∨P1)∨(R∨Q))",
        steps: 11,
    },
    {
        id: "disj-5",
        category: "disjunction",
        group: "mixed with conjunction",
        premises: ["(P∧(Q∨R))"],
        conclusion: "((P∧Q)∨(P∧R))",
        steps: 8,
    },
    {
        id: "disj-6",
        category: "disjunction",
        group: "mixed with conjunction",
        premises: ["((P∨Q)∧(P∨R))"],
        conclusion: "(P∨(Q∧R))",
        steps: 8,
    },
    {
        id: "disj-7",
        category: "disjunction",
        group: "mixed with conjunction",
        premises: ["((P∧Q)∨(P∧R))"],
        conclusion: "(P∧(Q∨R))",
        steps: 9,
    },
    {
        id: "disj-8",
        category: "disjunction",
        group: "mixed with conjunction",
        premises: ["(P∨(Q∧R))"],
        conclusion: "((P∨Q)∧(P∨R))",
        steps: 9,
    },
    {
        id: "disj-9",
        category: "disjunction",
        group: "mixed with implication",
        premises: ["((P→Q)∨Q)"],
        conclusion: "(P→Q)",
        steps: 2,
    },
    {
        id: "disj-10",
        category: "disjunction",
        group: "mixed with implication",
        premises: ["(P∨Q)"],
        conclusion: "((P→Q)→Q)",
        steps: 3,
    },
    {
        id: "disj-11",
        category: "disjunction",
        group: "mixed with implication",
        premises: ["((P→Q)→(P→R))"],
        conclusion: "((P∨R)→(Q→R))",
        steps: 6,
    },
    {
        id: "disj-12",
        category: "disjunction",
        group: "mixed with implication",
        premises: ["((P→Q)∨(P→R))"],
        conclusion: "(P→(Q∨R))",
        steps: 7,
    },
    {
        id: "disj-13",
        category: "disjunction",
        group: "mixed with conjunction and implication",
        premises: ["((P→Q)∧(Q→P))"],
        conclusion: "((P∨Q)→(P∧Q))",
        steps: 8,
    },
    {
        id: "disj-14",
        category: "disjunction",
        group: "mixed with conjunction and implication",
        premises: ["((P∨Q)→(P∧Q))"],
        conclusion: "((P→Q)∧(Q→P))",
        steps: 9,
    },
    {
        id: "disj-15",
        category: "disjunction",
        group: "mixed with conjunction and implication",
        premises: ["((Q→R)∧(Q∨P))"],
        conclusion: "((P→Q)→(R∧Q))",
        steps: 10,
    },

    /* ============================ 4.6 Negation ============================== */
    {
        id: "neg-1",
        category: "negation",
        group: "negation introduction",
        premises: ["P"],
        conclusion: "¬¬P",
        steps: 1,
    },
    {
        id: "neg-2",
        category: "negation",
        group: "negation introduction",
        premises: ["¬P"],
        conclusion: "¬(P∧Q)",
        steps: 2,
    },
    {
        id: "neg-3",
        category: "negation",
        group: "negation introduction",
        premises: ["(P→¬P)"],
        conclusion: "¬P",
        steps: 2,
    },
    {
        id: "neg-4",
        category: "negation",
        group: "negation introduction",
        premises: ["¬(P→Q)"],
        conclusion: "¬Q",
        steps: 2,
    },
    {
        id: "neg-5",
        category: "negation",
        group: "negation introduction",
        premises: ["¬(P∧Q)"],
        conclusion: "(P→¬Q)",
        steps: 3,
    },
    {
        id: "neg-6",
        category: "negation",
        group: "negation introduction",
        premises: ["(P→Q)"],
        conclusion: "(¬Q→¬P)",
        steps: 3,
    },
    {
        id: "neg-7",
        category: "negation",
        group: "negation introduction",
        premises: [],
        conclusion: "¬((P∧¬P)∨(Q∧¬Q))",
        steps: 4,
    },
    {
        id: "neg-8",
        category: "negation",
        group: "negation introduction",
        premises: ["¬(P∨Q)"],
        conclusion: "(¬P∧¬Q)",
        steps: 5,
    },
    {
        id: "neg-9",
        category: "negation",
        group: "negation introduction",
        premises: ["(¬P∨¬Q)"],
        conclusion: "¬(P∧Q)",
        steps: 5,
    },
    {
        id: "neg-10",
        category: "negation",
        group: "ex falso quodlibet",
        premises: ["¬P"],
        conclusion: "(P→Q)",
        steps: 2,
    },
    {
        id: "neg-11",
        category: "negation",
        group: "ex falso quodlibet",
        premises: ["(P∧¬P)"],
        conclusion: "Q",
        steps: 3,
    },
    {
        id: "neg-12",
        category: "negation",
        group: "ex falso quodlibet",
        premises: ["(P∨Q)"],
        conclusion: "(¬P→Q)",
        steps: 3,
    },
    {
        id: "neg-13",
        category: "negation",
        group: "ex falso quodlibet",
        premises: ["(P→Q)", "(P∧¬Q)"],
        conclusion: "R",
        steps: 4,
    },
    {
        id: "neg-15",
        category: "negation",
        group: "indirect proofs",
        premises: ["¬¬P"],
        conclusion: "P",
        steps: 1,
    },
    {
        id: "neg-16",
        category: "negation",
        group: "indirect proofs",
        premises: [],
        conclusion: "(P∨¬P)",
        steps: 4,
    },
    {
        id: "neg-17",
        category: "negation",
        group: "indirect proofs",
        premises: ["¬(¬P∨¬Q)"],
        conclusion: "(P∧Q)",
        steps: 5,
    },
    {
        id: "neg-18",
        category: "negation",
        group: "indirect proofs",
        premises: ["¬(P∧Q)"],
        conclusion: "(¬P∨¬Q)",
        steps: 6,
    },
    {
        id: "neg-19",
        category: "negation",
        group: "mixed",
        premises: ["¬(P→Q)"],
        conclusion: "P",
        steps: 3,
    },
    {
        id: "neg-20",
        category: "negation",
        group: "mixed",
        premises: ["((P→Q)→P)"],
        conclusion: "P",
        steps: 4,
    },
    {
        id: "neg-22",
        category: "negation",
        group: "mixed",
        premises: ["((P→Q)→Q)"],
        conclusion: "(¬Q→P)",
        steps: 5,
    },
    {
        id: "neg-23",
        category: "negation",
        group: "mixed",
        premises: ["(¬P∧¬Q)"],
        conclusion: "¬(P∨Q)",
        steps: 6,
    },
    {
        id: "neg-24",
        category: "negation",
        group: "mixed",
        premises: [],
        conclusion: "(P∨(P→Q))",
        steps: 6,
    },
    {
        id: "neg-25",
        category: "negation",
        group: "mixed",
        premises: [],
        conclusion: "((P→Q)∨(Q→R))",
        steps: 7,
    },
    {
        id: "neg-26",
        category: "negation",
        group: "mixed",
        premises: ["(¬P→Q)", "(R∨¬Q)", "(P→(Q1∨Q2))", "(¬R∧¬Q2)"],
        conclusion: "Q1",
        steps: 9,
    },
    {
        id: "neg-27",
        category: "negation",
        group: "mixed",
        premises: ["(P→(Q∨R))"],
        conclusion: "((P→Q)∨(P→R))",
        steps: 11,
    },
    {
        id: "neg-bonus-1",
        category: "negation",
        group: "bonus (without ¬E)",
        premises: ["¬¬¬P"],
        conclusion: "¬P",
    },
    {
        id: "neg-bonus-2",
        category: "negation",
        group: "bonus (two proofs)",
        premises: ["(¬¬P∧¬¬Q)"],
        conclusion: "(P∧Q)",
    },

    /* ==================== 4.5 (nur ↔-freie Aufgabe) ========================= */
    {
        id: "mixed-1",
        category: "mixed",
        group: "from §4.5",
        premises: [],
        conclusion: "((P∧Q)→((P→Q)→P))",
        steps: 5,
    },
];

let lastId: string | null = null;

export function randomProblem(category?: PracticeCategory): PracticeProblem {
    const pool = category
        ? PracticeProblems.filter((p) => p.category === category)
        : PracticeProblems;

    if (pool.length === 0) {
        throw new Error(`Keine Practice-Aufgaben für Kategorie: ${category}`);
    }

    let choice = pool[Math.floor(Math.random() * pool.length)]!;
    if (pool.length > 1) {
        while (choice.id === lastId) {
            choice = pool[Math.floor(Math.random() * pool.length)]!;
        }
    }
    lastId = choice.id;
    return choice;
}
