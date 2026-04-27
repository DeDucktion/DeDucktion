use crate::prop::formula::Formula;

use chumsky::Parser;
pub use formula::formula_parser;

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
}
