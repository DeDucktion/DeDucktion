use deducktion_engine::formula::parser::settings::ParsingSettings;

fn main() {
    let settings = ParsingSettings::default();
    deducktion_engine::formula::test_parser("not (not A or not B)", &settings);
}
