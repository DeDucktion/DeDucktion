use chumsky::prelude::*;
use chumsky::text::{ident, keyword};

use crate::formula::parser::settings::ParsingSettings;

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

    Var(String),
}

pub fn lexer<'src>(
    settings: &ParsingSettings,
) -> impl Parser<'src, &'src str, Vec<Token>, extra::Err<Rich<'src, char>>> {
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

    let var = variable(settings);

    simple
        .or(var)
        .padded()
        .recover_with(skip_then_retry_until(any().ignored(), end()))
        .repeated()
        .collect()
}

fn variable<'src>(
    settings: &ParsingSettings,
) -> impl Parser<'src, &'src str, Token, extra::Err<Rich<'src, char>>> {
    let var_matcher = match settings.variable_style {
        super::settings::VariableStyle::Letter => any().map(|c: char| c.to_string()).boxed(),
        super::settings::VariableStyle::UpperLetter => any()
            .filter(|c: &char| c.is_uppercase())
            .map(|c| c.to_string())
            .boxed(),
        super::settings::VariableStyle::LowerLetter => any()
            .filter(|c: &char| c.is_lowercase())
            .map(|c| c.to_string())
            .boxed(),
        super::settings::VariableStyle::Ident => ident().map(|s: &str| s.to_string()).boxed(),
    };

    var_matcher.map(Token::Var)
}
