use wasm_bindgen::prelude::*;

use deducktion_engine::derivation::RawDerivation;
use deducktion_engine::nd;
use deducktion_engine::prop::parser::settings::ParsingSettings;

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
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
