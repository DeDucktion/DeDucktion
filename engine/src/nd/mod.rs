use serde::{Deserialize, Serialize};

use crate::derivation::{GenericDerivation, RawDerivation};
use crate::prop;
use crate::prop::parser::settings::ParsingSettings;

pub mod parser;

pub type Derivation = GenericDerivation<Judgement, Option<String>>;

impl Derivation {
    pub fn parse(raw: &RawDerivation, settings: &ParsingSettings) -> Result<Self, ()> {
        // TODO: parsing of rule names
        let rule = raw.rule.clone();

        let mut premises = Vec::with_capacity(raw.premises.len());
        for premise in &raw.premises {
            let premise = Derivation::parse(premise, settings)?;
            premises.push(premise);
        }

        let conclusion = raw.conclusion.as_ref().ok_or(())?;
        let conclusion = Judgement::parse(conclusion, settings)?;

        Ok(Self {
            rule,
            premises,
            conclusion,
        })
    }
}

/// A judgement in an ND derivation is essentially just a formula of [prop].
/// Additionally, it holds the information whether it is a discharged assumption.
#[derive(Debug, Serialize, Deserialize)]
pub struct Judgement {
    pub formula: prop::Formula,
    pub discharged: bool,
}
