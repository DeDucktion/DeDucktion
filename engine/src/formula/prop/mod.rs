//! Propositional logic

use chumsky::Parser;

mod lexer;
mod parser;

pub fn test_lexer(s: &str) {
    let tokens = lexer::lexer().parse(s);
    dbg!(tokens);
}

#[derive(Debug, Clone)]
pub enum Formula {
    Var {
        name: String,
        discharged: bool,
    },
    Unary {
        connective: UnaryConnective,
        arg: Box<Formula>,
        discharged: bool,
    },
    Binary {
        connective: BinaryConnective,
        lhs: Box<Formula>,
        rhs: Box<Formula>,
        discharged: bool,
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
