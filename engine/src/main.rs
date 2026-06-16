use std::collections::HashSet;

use deducktion_engine::nd;
use deducktion_engine::prop::formula::Formula;
use deducktion_engine::prop::parser::settings::ParsingSettings;

fn main() {
    let settings = ParsingSettings::default();

    let proof = nd::Derivation {
        rule: Some(String::from("nd.and.intro")),
        premises: vec![
            nd::Derivation {
                rule: None,
                premises: vec![],
                conclusion: nd::Judgement::parse("a", &settings).unwrap(),
            },
            nd::Derivation {
                rule: None,
                premises: vec![],
                conclusion: nd::Judgement::parse("b", &settings).unwrap(),
            },
        ],
        conclusion: nd::Judgement::parse("a and b", &settings).unwrap(),
    };

    let mut context = HashSet::new();
    context.insert(Formula::parse("a", &settings).unwrap());
    context.insert(Formula::parse("b", &settings).unwrap());

    dbg!(proof.check(&nd::RULES_MAP, &context, &HashSet::new()));
}
