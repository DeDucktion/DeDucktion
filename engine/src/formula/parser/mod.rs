use chumsky::input::ValueInput;
use chumsky::prelude::*;

use crate::formula::{BinaryConnective, Formula, UnaryConnective};

use lexer::Token;
use settings::ParsingSettings;

pub mod lexer;
pub mod settings;

/// Parses a formula that may be marked as discharged
pub fn formula_parser<'tok, I>(
    settings: &ParsingSettings,
) -> impl Parser<'tok, I, (Formula, bool), extra::Err<Rich<'tok, Token>>>
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    let formula = match settings.parenthesization_style {
        settings::ParenthesizationStyle::Strict => formula_strict().boxed(),
        settings::ParenthesizationStyle::Lax => formula_lax().boxed(),
    };

    let not_discharged = formula.clone().map(|f| (f, false));

    let discharged = formula
        .delimited_by(just(Token::BracketOpen), just(Token::BracketClose))
        .map(|f| (f, true));

    discharged.or(not_discharged)
}

// Fully parenthesized formula.
fn formula_strict<'tok, I>() -> impl Parser<'tok, I, Formula, extra::Err<Rich<'tok, Token>>> + Clone
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    recursive(|formula| {
        let var = select! { Token::Var(var) => Formula::Var(var) };

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

        choice((var, unary, binary))
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
