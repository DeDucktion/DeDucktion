//! Propositional logic

#[derive(Debug, Clone)]
pub enum Formula {
    Var(String),
    Unary {
        connective: UnaryConnective,
        arg: Box<Formula>,
    },
    Binary {
        connective: BinaryConnective,
        lhs: Box<Formula>,
        rhs: Box<Formula>,
    },
}

#[derive(Debug, Clone, Copy)]
pub enum UnaryConnective {
    Not,
}

#[derive(Debug, Clone, Copy)]
pub enum BinaryConnective {
    And,
    Or,
    Imp,
}
