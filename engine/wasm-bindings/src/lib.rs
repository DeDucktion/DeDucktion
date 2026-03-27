use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn add(x: u64, y: u64) -> Result<u64, u64> {
    if x == 42 && y == 42 {
        return Err(42);
    }
    Ok(deducktion_engine::add(x, y))
}
