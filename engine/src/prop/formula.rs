//! Formulas of propositional logic

/// A formula of propositional logic.
#[derive(Debug, Clone)]
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

#[derive(Debug, Clone, Copy)]
pub enum UnaryConnective {
    /// Negation.
    Not,
}

#[derive(Debug, Clone, Copy)]
pub enum BinaryConnective {
    /// Conjunction.
    And,

    /// Disjunction.
    Or,

    /// Implication.
    Imp,
}
