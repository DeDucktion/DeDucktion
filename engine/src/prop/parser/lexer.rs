use chumsky::prelude::*;
use chumsky::text::{ident, keyword};

use super::settings::{ParsingSettings, PropStyle};

#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    ParenOpen,
    ParenClose,
    BracketOpen,
    BracketClose,

    Comma,

    And,
    Or,
    Imp,
    Biimp,
    Not,

    Prop(String),
}

pub fn lexer<'src>(
    settings: &ParsingSettings,
) -> impl Parser<'src, &'src str, Vec<Token>, extra::Err<Rich<'src, char>>> {
    let simple = choice((
        just('(').to(Token::ParenOpen),
        just(')').to(Token::ParenClose),
        just('[').to(Token::BracketOpen),
        just(']').to(Token::BracketClose),
        just(',').to(Token::Comma),
        choice((just("∧"), keyword("and"), just("<"))).to(Token::And),
        choice((just("∨"), keyword("or"), just(">"))).to(Token::Or),
        choice((just("→"), keyword("to"), keyword("implies"), just("->"))).to(Token::Imp),
        choice((just("↔"), keyword("iff"), just("<->"))).to(Token::Biimp),
        choice((just("¬"), keyword("not"), just("~"), just("!"))).to(Token::Not),
    ));

    let prop = proposition(settings);

    simple
        .or(prop)
        .padded()
        .recover_with(skip_then_retry_until(any().ignored(), end()))
        .repeated()
        .collect()
}

fn proposition<'src>(
    settings: &ParsingSettings,
) -> impl Parser<'src, &'src str, Token, extra::Err<Rich<'src, char>>> {
    let prop_matcher = match settings.prop_style {
        PropStyle::Letter => any().map(|c: char| c.to_string()).boxed(),
        PropStyle::UpperLetter => any()
            .filter(|c: &char| c.is_uppercase())
            .map(|c| c.to_string())
            .boxed(),
        PropStyle::LowerLetter => any()
            .filter(|c: &char| c.is_lowercase())
            .map(|c| c.to_string())
            .boxed(),
        PropStyle::Ident => ident().map(|s: &str| s.to_string()).boxed(),
        PropStyle::PQRIndexed => one_of(['P', 'Q', 'R'])
            .then(
                any()
                    .filter(|c: &char| c.is_ascii_digit())
                    .repeated()
                    .collect::<String>(),
            )
            .map(|(c, digits): (char, String)| format!("{c}{digits}"))
            .boxed(),
    };

    prop_matcher.map(Token::Prop)
}
