//! Formulas of propositional logic

mod parser;

pub fn test_lexer(s: &str) {
    use chumsky::Parser;

    let tokens = parser::lexer::lexer().parse(s);
    dbg!(tokens);
}

pub fn test_parser(s: &str) {
    use chumsky::Parser;

    let tokens = parser::lexer::lexer().parse(s).unwrap();
    let formula = parser::formula_parser().parse(tokens.as_slice()).unwrap();
    dbg!(formula);
}

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
