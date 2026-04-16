pub use formula::Formula;

mod formula;
pub mod parser;

pub fn test_lexer(s: &str, settings: &parser::settings::ParsingSettings) {
    use chumsky::Parser;

    let tokens = parser::lexer::lexer(settings).parse(s);
    dbg!(tokens);
}

pub fn test_parser(s: &str, settings: &parser::settings::ParsingSettings) {
    use chumsky::Parser;

    let tokens = parser::lexer::lexer(settings).parse(s).unwrap();
    let formula = parser::formula_parser(settings)
        .parse(tokens.as_slice())
        .unwrap();
    dbg!(formula);
}
