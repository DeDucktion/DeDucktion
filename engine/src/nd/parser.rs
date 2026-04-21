use chumsky::input::ValueInput;
use chumsky::prelude::*;

use crate::nd::Judgement;
use crate::prop::parser::formula_parser;
use crate::prop::parser::lexer::{Token, lexer};
use crate::prop::parser::settings::ParsingSettings;

/// Parses a judgement of ND.
pub fn judgement_parser<'tok, I>(
    settings: &ParsingSettings,
) -> impl Parser<'tok, I, Judgement, extra::Err<Rich<'tok, Token>>>
where
    I: ValueInput<'tok, Token = Token, Span = SimpleSpan>,
{
    let discharged = formula_parser(settings)
        .delimited_by(just(Token::BracketOpen), just(Token::BracketClose))
        .map(|formula| Judgement {
            formula,
            discharged: true,
        });

    let not_discharged = formula_parser(settings).map(|formula| Judgement {
        formula,
        discharged: false,
    });

    choice((discharged, not_discharged))
}

impl Judgement {
    pub fn parse(s: &str, settings: &ParsingSettings) -> Result<Self, ()> {
        let tokens = lexer(settings).parse(s).into_output().ok_or(())?;

        let judgement = judgement_parser(settings)
            .parse(tokens.as_slice())
            .into_output()
            .ok_or(())?;

        Ok(judgement)
    }
}
