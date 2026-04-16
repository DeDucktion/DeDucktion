use deducktion_engine::prop::parser::settings::ParsingSettings;

fn main() {
    let settings = ParsingSettings::default();
    deducktion_engine::prop::test_parser("not (not A or not B)", &settings);
}
