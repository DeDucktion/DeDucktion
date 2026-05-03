use std::collections::HashMap;
use std::sync::LazyLock;

use crate::prop::formula::BinaryConnective;
use crate::prop::pattern::FormulaPattern;

pub static RULES: LazyLock<HashMap<String, Rule>> = LazyLock::new(|| {
    HashMap::from([
        (String::from("nd.and.intro"), and_intro()),
        (String::from("nd.or.elim"), or_elim()),
    ])
});

/// An inference rule.
#[derive(Debug, Clone, PartialEq, Hash)]
pub struct Rule {
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
        premises: vec![
            Premise {
                pattern: FormulaPattern::Meta(String::from("A")),
                assumptions: vec![],
            },
            Premise {
                pattern: FormulaPattern::Meta(String::from("B")),
                assumptions: vec![],
            },
        ],
        conclusion: FormulaPattern::Binary {
            connective: BinaryConnective::And,
            lhs: Box::new(FormulaPattern::Meta(String::from("A"))),
            rhs: Box::new(FormulaPattern::Meta(String::from("B"))),
        },
    }
}

/// Elimination rule for disjunction.
pub fn or_elim() -> Rule {
    Rule {
        premises: vec![
            Premise {
                pattern: FormulaPattern::Binary {
                    connective: BinaryConnective::Or,
                    lhs: Box::new(FormulaPattern::Meta(String::from("A"))),
                    rhs: Box::new(FormulaPattern::Meta(String::from("B"))),
                },
                assumptions: vec![],
            },
            Premise {
                pattern: FormulaPattern::Meta(String::from("C")),
                assumptions: vec![FormulaPattern::Meta(String::from("A"))],
            },
            Premise {
                pattern: FormulaPattern::Meta(String::from("C")),
                assumptions: vec![FormulaPattern::Meta(String::from("B"))],
            },
        ],
        conclusion: FormulaPattern::Meta(String::from("C")),
    }
}
