use std::collections::HashSet;

use wasm_bindgen::prelude::*;

use deducktion_engine::derivation::RawDerivation;
use deducktion_engine::prop::parser::settings::ParsingSettings;
use deducktion_engine::{nd, prop};

#[wasm_bindgen(getter_with_clone)]
pub struct Rule {
    pub id: String,
    pub arity: usize,
    pub label: String,
}

#[wasm_bindgen]
pub fn get_rules() -> Vec<Rule> {
    nd::RULES
        .iter()
        .map(|(id, rule)| Rule {
            id: id.clone(),
            arity: rule.premises.len(),
            label: rule.label.clone(),
        })
        .collect()
}

#[wasm_bindgen]
pub fn parse_derivation(derivation: JsValue) -> Result<JsValue, JsValue> {
    let derivation: RawDerivation = serde_wasm_bindgen::from_value(derivation)?;
    log(&format!("{derivation:#?}"));
    let derivation: nd::Derivation =
        nd::Derivation::parse(&derivation, &ParsingSettings::default())
            .map_err(|_| JsValue::undefined())?;
    Ok(serde_wasm_bindgen::to_value(&derivation)?)
}

#[wasm_bindgen]
pub fn validate(
    derivation: JsValue,
    premises: String,
    conclusion: String,
) -> Result<JsValue, JsValue> {
    log(&format!("validating..."));

    let derivation: RawDerivation = serde_wasm_bindgen::from_value(derivation)?;

    log(&format!("INPUT:\n{derivation:#?}"));

    let derivation: nd::Derivation =
        nd::Derivation::parse(&derivation, &ParsingSettings::default())
            .map_err(|_| JsValue::undefined())?;

    log(&format!("PARSED:\n{derivation:#?}"));

    let premises = prop::Formula::parse_list(&premises, &ParsingSettings::default())
        .map_err(|_| JsValue::undefined())?;
    let premises = HashSet::from_iter(premises);

    let conclusion = prop::Formula::parse(&conclusion, &ParsingSettings::default())
        .map_err(|_| JsValue::undefined())?;

    derivation
        .check(&nd::RULES_MAP, &premises, &HashSet::new())
        .ok_or(JsValue::undefined())?;

    if conclusion != derivation.conclusion.formula {
        return Err(JsValue::undefined());
    }

    Ok(JsValue::undefined())
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
