//! Formulas of propositional logic

use serde::{Deserialize, Serialize};

/// A formula of propositional logic.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum UnaryConnective {
    /// Negation.
    Not,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BinaryConnective {
    /// Conjunction.
    And,

    /// Disjunction.
    Or,

    /// Implication.
    Imp,
}
