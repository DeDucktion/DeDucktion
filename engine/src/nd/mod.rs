use std::collections::{HashMap, HashSet};

use serde::{Deserialize, Serialize};

use crate::derivation::{GenericDerivation, RawDerivation};
use crate::nd::rules::Rule;
use crate::prop::formula::Formula;
use crate::prop::parser::settings::ParsingSettings;

pub mod parser;
pub mod rules;

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

    pub fn check(
        &self,
        rules: &HashMap<String, Rule>,
        global_context: &HashSet<Formula>,
        local_context: &HashSet<Formula>,
    ) -> Option<()> {
        let Self {
            rule,
            premises,
            conclusion,
        } = self;

        // valid proof leaf
        if rule.is_none() && premises.is_empty() {
            return if conclusion.discharged {
                if local_context.contains(&conclusion.formula) {
                    Some(())
                } else {
                    None
                }
            } else {
                if global_context.contains(&conclusion.formula) {
                    Some(())
                } else {
                    None
                }
            };
        }

        let rule = rule.as_ref().and_then(|rule| rules.get(rule))?;

        // check arity
        if premises.len() != rule.premises.len() {
            return None;
        }

        // check syntactic validity of rule
        let mut bindings = HashMap::new();
        if !rule.conclusion.matches(&conclusion.formula, &mut bindings) {
            return None;
        }
        for (premise, premise_rule) in premises.iter().zip(rule.premises.iter()) {
            if !premise_rule
                .pattern
                .matches(&premise.conclusion.formula, &mut bindings)
            {
                return None;
            }
        }

        // check subproofs
        for (premise, premise_rule) in premises.iter().zip(rule.premises.iter()) {
            let mut extended_local_context = local_context.clone();
            for assumption in &premise_rule.assumptions {
                let assumption = assumption.clone().substitute(&bindings)?;
                extended_local_context.insert(assumption);
            }

            premise.check(rules, global_context, &extended_local_context)?;
        }

        Some(())
    }
}

/// A judgement in an ND derivation is essentially just a formula of [prop].
/// Additionally, it holds the information whether it is a discharged assumption.
#[derive(Debug, Serialize, Deserialize)]
pub struct Judgement {
    pub formula: Formula,
    pub discharged: bool,
}
