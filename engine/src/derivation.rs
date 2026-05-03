use serde::{Deserialize, Serialize};

/// An unparsed derivation tree with [String] nodes.
pub type RawDerivation = GenericDerivation<Option<String>, Option<String>>;

/// A generic derivation tree over some judgement type `J` and some rule type `R`.
#[derive(Debug, Serialize, Deserialize)]
pub struct GenericDerivation<J, R> {
    pub rule: R,
    pub premises: Vec<GenericDerivation<J, R>>,
    pub conclusion: J,
}
