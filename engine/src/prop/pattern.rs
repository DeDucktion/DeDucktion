use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::prop::formula::{BinaryConnective, Formula, UnaryConnective};

/// A formula pattern of propositional logic that can contain meta-variables.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FormulaPattern {
    /// An atomic proposition symbol.
    Prop(String),

    /// A unary connective.
    Unary {
        connective: UnaryConnective,
        arg: Box<FormulaPattern>,
    },

    /// A binary connective.
    Binary {
        connective: BinaryConnective,
        lhs: Box<FormulaPattern>,
        rhs: Box<FormulaPattern>,
    },

    /// A meta-variable representing some formula.
    Meta(String),
}

impl FormulaPattern {
    pub fn matches(&self, formula: &Formula, bindings: &mut HashMap<String, Formula>) -> bool {
        match (self, formula) {
            (FormulaPattern::Prop(pattern), Formula::Prop(prop)) => pattern == prop,
            (
                FormulaPattern::Unary {
                    connective: pattern_connective,
                    arg: pattern,
                },
                Formula::Unary { connective, arg },
            ) => pattern_connective == connective && pattern.matches(arg, bindings),
            (
                FormulaPattern::Binary {
                    connective: pattern_connective,
                    lhs: pattern_lhs,
                    rhs: pattern_rhs,
                },
                Formula::Binary {
                    connective,
                    lhs,
                    rhs,
                },
            ) => {
                pattern_connective == connective
                    && pattern_lhs.matches(lhs, bindings)
                    && pattern_rhs.matches(rhs, bindings)
            }
            (FormulaPattern::Meta(meta), formula) => {
                if let Some(binding) = bindings.get(meta) {
                    binding == formula
                } else {
                    bindings.insert(meta.clone(), formula.clone());
                    true
                }
            }
            _ => false,
        }
    }
}
