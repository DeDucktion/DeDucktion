use chumsky::input::ValueInput;
use chumsky::prelude::*;

use crate::prop::formula::{BinaryConnective, Formula, UnaryConnective};

use super::lexer::Token;
use super::settings::{ParenStyle, ParsingSettings};

/// Parses a formula of propositional logic.
pub fn formula_parser<'tok, I>(
    settings: &ParsingSettings,
) -> impl Parser<'tok, I, Formula, extra::Err<Rich<'tok, Token>>>
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    match settings.paren_style {
        ParenStyle::Strict => formula_strict().boxed(),
        ParenStyle::Lax => formula_lax().boxed(),
    }
}

/// Parses a list of formulas of propositional logic.
pub fn formula_list_parser<'tok, I>(
    settings: &ParsingSettings,
) -> impl Parser<'tok, I, Vec<Formula>, extra::Err<Rich<'tok, Token>>>
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    formula_parser(settings)
        .separated_by(just(Token::Comma))
        .collect()
}

// Fully parenthesized formula.
fn formula_strict<'tok, I>() -> impl Parser<'tok, I, Formula, extra::Err<Rich<'tok, Token>>> + Clone
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    recursive(|formula| {
        let prop = select! { Token::Prop(prop) => Formula::Prop(prop) };

        let unary = unary_connective()
            .then(formula.clone())
            .map(|(connective, arg)| Formula::Unary {
                connective,
                arg: Box::new(arg),
            });

        let binary = formula
            .clone()
            .then(binary_connective())
            .then(formula.clone())
            .delimited_by(just(Token::ParenOpen), just(Token::ParenClose))
            .map(|((lhs, connective), rhs)| Formula::Binary {
                connective,
                lhs: Box::new(lhs),
                rhs: Box::new(rhs),
            });

        choice((prop, unary, binary))
    })
}

// For now, the lax version only allows to omit outermost parentheses.
fn formula_lax<'tok, I>() -> impl Parser<'tok, I, Formula, extra::Err<Rich<'tok, Token>>> + Clone
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    let strict = formula_strict();

    let top_level_binary = strict
        .clone()
        .then(binary_connective())
        .then(strict.clone())
        .map(|((lhs, connective), rhs)| Formula::Binary {
            connective,
            lhs: Box::new(lhs),
            rhs: Box::new(rhs),
        });

    choice((top_level_binary, strict))
}

fn unary_connective<'tok, I>()
-> impl Parser<'tok, I, UnaryConnective, extra::Err<Rich<'tok, Token>>> + Clone
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    just(Token::Not).to(UnaryConnective::Not)
}

fn binary_connective<'tok, I>()
-> impl Parser<'tok, I, BinaryConnective, extra::Err<Rich<'tok, Token>>> + Clone
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    choice((
        just(Token::And).to(BinaryConnective::And),
        just(Token::Or).to(BinaryConnective::Or),
        just(Token::Imp).to(BinaryConnective::Imp),
    ))
}
