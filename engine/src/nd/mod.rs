use std::collections::{HashMap, HashSet};

use serde::{Deserialize, Serialize};

use crate::derivation::{GenericDerivation, RawDerivation};
use crate::export::{self, Export};
use crate::nd::rules::Rule;
use crate::prop::formula::Formula;
use crate::prop::parser::settings::ParsingSettings;

pub use crate::nd::rules::{RULES, RULES_MAP};

pub mod parser;
pub mod rules;

pub type Derivation = GenericDerivation<Judgement, RuleRef>;

#[derive(Debug, Serialize, Deserialize)]
pub enum RuleRef {
    Axiom,
    Id(String),
}

impl Export for RuleRef {
    fn export(&self, settings: export::Settings) -> String {
        if let RuleRef::Id(id) = &self
            && let Some(rule) = RULES_MAP.get(id)
        {
            let label = match settings.format {
                export::Format::Typst => rule.typst.clone(),
                export::Format::Latex => rule.latex.clone(),
            };
            if settings.outermost {
                format!("${}$", label)
            } else {
                label
            }
        } else {
            String::new()
        }
    }
}

impl Derivation {
    pub fn parse(raw: &RawDerivation, settings: &ParsingSettings) -> Result<Self, ()> {
        let rule = match raw.rule {
            Some(ref id) if RULES_MAP.contains_key(id) => RuleRef::Id(id.clone()),
            None if raw.premises.is_empty() => RuleRef::Axiom,
            _ => return Err(()),
        };

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
        let rule = match rule {
            RuleRef::Axiom => {
                // This shouldn't happen by parsing.
                if !premises.is_empty() {
                    return None;
                }

                // A local assumption MUST be discharged
                if !conclusion.discharged && local_context.contains(&conclusion.formula) {
                    return None;
                }

                let context = if conclusion.discharged {
                    &local_context
                } else {
                    &global_context
                };

                return context.contains(&conclusion.formula).then_some(());
            }
            RuleRef::Id(id) => {
                // This should always work by parsing.
                rules.get(id)?
            }
        };

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

impl Export for Judgement {
    fn export(&self, settings: export::Settings) -> String {
        if self.discharged {
            format!("[{}]", self.formula.export(settings.outer()))
        } else {
            self.formula.export(settings)
        }
    }
}
