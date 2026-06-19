use crate::prop::formula::Formula;

use chumsky::Parser;
pub use formula::{formula_list_parser, formula_parser};

mod formula;
pub mod lexer;
pub mod settings;

impl Formula {
    pub fn parse(s: &str, settings: &settings::ParsingSettings) -> Result<Self, ()> {
        let tokens = lexer::lexer(settings).parse(s).into_output().ok_or(())?;

        let formula = formula_parser(settings)
            .parse(tokens.as_slice())
            .into_output()
            .ok_or(())?;

        Ok(formula)
    }

    pub fn parse_list(s: &str, settings: &settings::ParsingSettings) -> Result<Vec<Self>, ()> {
        let tokens = lexer::lexer(settings).parse(s).into_output().ok_or(())?;

        let formula_list = formula_list_parser(settings)
            .parse(tokens.as_slice())
            .into_output()
            .ok_or(())?;

        Ok(formula_list)
    }
}
