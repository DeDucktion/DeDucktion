use deducktion_engine::prop::formula::Formula;
use deducktion_engine::prop::parser::settings::ParsingSettings;

fn main() {
    let settings = ParsingSettings::default();
    let formula = Formula::parse("not (not A and B)", &settings);
    let _ = dbg!(formula);
}
