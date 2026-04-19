use deducktion_engine::prop::{Formula, parser::settings::ParsingSettings};

fn main() {
    let settings = ParsingSettings::default();
    let formula = Formula::parse("not (not A and B)", &settings);
    let _ = dbg!(formula);
}
