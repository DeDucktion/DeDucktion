use chumsky::input::ValueInput;
use chumsky::prelude::*;

use crate::formula::{BinaryConnective, Formula, UnaryConnective};

use lexer::Token;

pub mod lexer;
pub mod settings;

/// Parses a formula that may be marked as discharged
pub fn formula_parser<'tok, I>()
-> impl Parser<'tok, I, (Formula, bool), extra::Err<Rich<'tok, Token>>>
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    let not_discharged = formula().map(|f| (f, false));

    let discharged = formula()
        .delimited_by(just(Token::BracketOpen), just(Token::BracketClose))
        .map(|f| (f, true));

    discharged.or(not_discharged)
}

fn formula<'tok, I>() -> impl Parser<'tok, I, Formula, extra::Err<Rich<'tok, Token>>>
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    recursive(|formula| {
        let var = select! { Token::Ident(var) => Formula::Var(var) };

        let atom = choice((
            var,
            formula
                .clone()
                .delimited_by(just(Token::ParenOpen), just(Token::ParenClose)),
        ));

        let unary = unary_connective()
            .repeated()
            .foldr(atom.clone(), |connective, arg| Formula::Unary {
                connective,
                arg: Box::new(arg),
            });

        let atom2 = unary.clone().or(atom.clone());

        let binary = atom2
            .clone()
            .then(binary_connective())
            .then(atom2.clone())
            .map(|((lhs, connective), rhs)| Formula::Binary {
                connective,
                lhs: Box::new(lhs),
                rhs: Box::new(rhs),
            });

        let atom3 = binary.or(atom2);

        atom3
    })
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
