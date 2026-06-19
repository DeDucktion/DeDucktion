use std::collections::HashMap;
use std::sync::LazyLock;

use crate::prop::formula::BinaryConnective;
use crate::prop::formula::BinaryConnective::*;
use crate::prop::formula::UnaryConnective;
use crate::prop::formula::UnaryConnective::*;
use crate::prop::pattern::FormulaPattern;

pub static RULES: LazyLock<Vec<(String, Rule)>> = LazyLock::new(|| {
    vec![
        (String::from("nd.and.intro"), and_intro()),
        (String::from("nd.and.elim.1"), and_elim1()),
        (String::from("nd.and.elim.2"), and_elim2()),
        (String::from("nd.or.intro.1"), or_intro1()),
        (String::from("nd.or.intro.2"), or_intro2()),
        (String::from("nd.or.elim"), or_elim()),
        (String::from("nd.imp.intro"), imp_intro()),
        (String::from("nd.imp.elim"), imp_elim()),
        (String::from("nd.neg.intro"), neg_intro()),
        (String::from("nd.neg.elim"), neg_elim()),
        (String::from("nd.biimp.intro"), biimp_intro()),
        (String::from("nd.biimp.elim.1"), biimp_elim1()),
        (String::from("nd.biimp.elim.2"), biimp_elim2()),
    ]
});

pub static RULES_MAP: LazyLock<HashMap<String, Rule>> =
    LazyLock::new(|| HashMap::from_iter(RULES.clone()));

/// An inference rule.
#[derive(Debug, Clone, PartialEq, Hash)]
pub struct Rule {
    pub label: String,
    pub typst: String,
    pub latex: String,
    pub premises: Vec<Premise>,
    pub conclusion: FormulaPattern,
}

/// A premise of a [Rule].
#[derive(Debug, Clone, PartialEq, Hash)]
pub struct Premise {
    /// The syntax of the premise.
    pub pattern: FormulaPattern,

    /// The assumptions that hold for the premise.
    pub assumptions: Vec<FormulaPattern>,
}

/// Introduction rule for conjunction.
pub fn and_intro() -> Rule {
    Rule {
        label: "∧I".to_string(),
        typst: "and I".to_string(),
        latex: r#"\land I"#.to_string(),
        premises: vec![
            Premise {
                pattern: meta("A"),
                assumptions: vec![],
            },
            Premise {
                pattern: meta("B"),
                assumptions: vec![],
            },
        ],
        conclusion: binary(meta("A"), And, meta("B")),
    }
}

/// Elimination rule for conjuction (left).
pub fn and_elim1() -> Rule {
    Rule {
        label: "∧E1".to_string(),
        typst: "and E 1".to_string(),
        latex: r#"\land E1"#.to_string(),
        premises: vec![Premise {
            pattern: binary(meta("A"), And, meta("B")),
            assumptions: vec![],
        }],
        conclusion: meta("A"),
    }
}

/// Elimination rule for conjuction (right).
pub fn and_elim2() -> Rule {
    Rule {
        label: "∧E2".to_string(),
        typst: "and E 2".to_string(),
        latex: r#"\land E2"#.to_string(),
        premises: vec![Premise {
            pattern: binary(meta("A"), And, meta("B")),
            assumptions: vec![],
        }],
        conclusion: meta("B"),
    }
}

/// Introduction rule for disjunction (left).
pub fn or_intro1() -> Rule {
    Rule {
        label: "∨I1".to_string(),
        typst: "or I 1".to_string(),
        latex: r#"\lor I1"#.to_string(),
        premises: vec![Premise {
            pattern: meta("A"),
            assumptions: vec![],
        }],
        conclusion: binary(meta("A"), Or, meta("B")),
    }
}

/// Introduction rule for disjunction (left).
pub fn or_intro2() -> Rule {
    Rule {
        label: "∨I2".to_string(),
        typst: "or I 2".to_string(),
        latex: r#"\lor I2"#.to_string(),
        premises: vec![Premise {
            pattern: meta("B"),
            assumptions: vec![],
        }],
        conclusion: binary(meta("A"), Or, meta("B")),
    }
}

/// Elimination rule for disjunction.
pub fn or_elim() -> Rule {
    Rule {
        label: "∨E".to_string(),
        typst: "or E".to_string(),
        latex: r#"\lor E"#.to_string(),
        premises: vec![
            Premise {
                pattern: binary(meta("A"), Or, meta("B")),
                assumptions: vec![],
            },
            Premise {
                pattern: meta("C"),
                assumptions: vec![meta("A")],
            },
            Premise {
                pattern: meta("C"),
                assumptions: vec![meta("B")],
            },
        ],
        conclusion: meta("C"),
    }
}

/// Introduction rule for implication.
pub fn imp_intro() -> Rule {
    Rule {
        label: "→I".to_string(),
        typst: "->I".to_string(),
        latex: r#"\to I"#.to_string(),
        premises: vec![Premise {
            pattern: meta("B"),
            assumptions: vec![meta("A")],
        }],
        conclusion: binary(meta("A"), Imp, meta("B")),
    }
}

/// Elimination rule for implication.
pub fn imp_elim() -> Rule {
    Rule {
        label: "→E".to_string(),
        typst: "->E".to_string(),
        latex: r#"\to E"#.to_string(),
        premises: vec![
            Premise {
                pattern: binary(meta("A"), Imp, meta("B")),
                assumptions: vec![],
            },
            Premise {
                pattern: meta("A"),
                assumptions: vec![],
            },
        ],
        conclusion: meta("B"),
    }
}

/// Introduction rule for negation.
pub fn neg_intro() -> Rule {
    Rule {
        label: "¬I".to_string(),
        typst: "not I".to_string(),
        latex: r#"\neg I"#.to_string(),
        premises: vec![
            Premise {
                pattern: meta("B"),
                assumptions: vec![meta("A")],
            },
            Premise {
                pattern: unary(Not, meta("B")),
                assumptions: vec![meta("A")],
            },
        ],
        conclusion: unary(Not, meta("A")),
    }
}

/// Introduction rule for negation.
pub fn neg_elim() -> Rule {
    Rule {
        label: "¬E".to_string(),
        typst: "not E".to_string(),
        latex: r#"\neg E"#.to_string(),
        premises: vec![
            Premise {
                pattern: meta("B"),
                assumptions: vec![unary(Not, meta("A"))],
            },
            Premise {
                pattern: unary(Not, meta("B")),
                assumptions: vec![unary(Not, meta("A"))],
            },
        ],
        conclusion: meta("A"),
    }
}

/// Introduction rule for biimplication.
pub fn biimp_intro() -> Rule {
    Rule {
        label: "↔I".to_string(),
        typst: "<->I".to_string(),
        latex: r#"\leftrightarrow I"#.to_string(),
        premises: vec![
            Premise {
                pattern: meta("B"),
                assumptions: vec![meta("A")],
            },
            Premise {
                pattern: meta("A"),
                assumptions: vec![meta("B")],
            },
        ],
        conclusion: binary(meta("A"), Biimp, meta("B")),
    }
}

/// Elimination rule for biimplication (left).
pub fn biimp_elim1() -> Rule {
    Rule {
        label: "↔E1".to_string(),
        typst: "<->E 1".to_string(),
        latex: r#"\leftrightarrow E1"#.to_string(),
        premises: vec![
            Premise {
                pattern: binary(meta("A"), Biimp, meta("B")),
                assumptions: vec![],
            },
            Premise {
                pattern: meta("B"),
                assumptions: vec![],
            },
        ],
        conclusion: meta("A"),
    }
}

/// Elimination rule for biimplication (right).
pub fn biimp_elim2() -> Rule {
    Rule {
        label: "↔E2".to_string(),
        typst: "<->E 1".to_string(),
        latex: r#"\leftrightarrow E1"#.to_string(),
        premises: vec![
            Premise {
                pattern: binary(meta("A"), Biimp, meta("B")),
                assumptions: vec![],
            },
            Premise {
                pattern: meta("A"),
                assumptions: vec![],
            },
        ],
        conclusion: meta("B"),
    }
}

fn meta(name: &str) -> FormulaPattern {
    FormulaPattern::Meta(name.to_string())
}

fn binary(
    lhs: FormulaPattern,
    connective: BinaryConnective,
    rhs: FormulaPattern,
) -> FormulaPattern {
    FormulaPattern::Binary {
        connective,
        lhs: Box::new(lhs),
        rhs: Box::new(rhs),
    }
}

fn unary(connective: UnaryConnective, arg: FormulaPattern) -> FormulaPattern {
    FormulaPattern::Unary {
        connective,
        arg: Box::new(arg),
    }
}
