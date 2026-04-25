//! Formulas of propositional logic

use serde::{Deserialize, Serialize};

/// A formula of propositional logic.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Formula {
    /// An atomic proposition symbol.
    Prop(String),

    /// A unary connective.
    Unary {
        connective: UnaryConnective,
        arg: Box<Formula>,
    },

    /// A binary connective.
    Binary {
        connective: BinaryConnective,
        lhs: Box<Formula>,
        rhs: Box<Formula>,
    },
}

/// A formula pattern of propositional logic that can contain meta-variables.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FormulaPattern {
    /// An atomic proposition symbol.
    Prop(String),

    /// A unary connective.
    Unary {
        connective: UnaryConnective,
        arg: Box<FormulaPattern>,
    },

    /// A binary connective.
    Binary {
        connective: BinaryConnective,
        lhs: Box<FormulaPattern>,
        rhs: Box<FormulaPattern>,
    },

    /// A meta-variable representing some formula.
    Meta(String),
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum UnaryConnective {
    /// Negation.
    Not,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum BinaryConnective {
    /// Conjunction.
    And,

    /// Disjunction.
    Or,

    /// Implication.
    Imp,
}
