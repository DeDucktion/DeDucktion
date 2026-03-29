use chumsky::prelude::*;
use chumsky::text::{ident, keyword};

#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    ParenOpen,
    ParenClose,
    BracketOpen,
    BracketClose,

    And,
    Or,
    Imp,
    Not,

    Ident(String),
}

pub fn lexer<'src>() -> impl Parser<'src, &'src str, Vec<Token>, extra::Err<Rich<'src, char>>> {
    let simple = choice((
        just('(').to(Token::ParenOpen),
        just(')').to(Token::ParenClose),
        just('[').to(Token::BracketOpen),
        just(']').to(Token::BracketClose),
        choice((just("∧"), keyword("and"), just("<"))).to(Token::And),
        choice((just("∨"), keyword("or"), just(">"))).to(Token::Or),
        choice((just("→"), keyword("to"), keyword("implies"), just("->"))).to(Token::Imp),
        choice((just("→"), keyword("not"), just("~"), just("!"))).to(Token::Not),
    ));

    let ident = ident().map(|ident: &str| Token::Ident(ident.to_string()));

    simple.or(ident).padded().repeated().collect()
}
