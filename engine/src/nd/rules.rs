use crate::prop::formula::BinaryConnective;
use crate::prop::pattern::FormulaPattern;

/// An inference rule.
pub struct Rule {
    pub premises: Vec<Premise>,
    pub conclusion: FormulaPattern,
}

/// A premise of a [Rule].
pub struct Premise {
    /// The syntax of the premise.
    pub pattern: FormulaPattern,

    /// The assumptions that hold for the premise.
    pub assumptions: Vec<FormulaPattern>,
}

/// Example: inference rule for conjunction introduction.
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
