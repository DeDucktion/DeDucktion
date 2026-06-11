//! Formulas of propositional logic

use serde::{Deserialize, Serialize};

/// A formula of propositional logic.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Formula {
    /// An atomic proposition symbol.
    Prop(String),

    /// A unary connective.
    Unary {
        connective: UnaryConnective,
        arg: Box<Formula>,
    },

    /// A binary connective.
    Binary {
        connective: BinaryConnective,
        lhs: Box<Formula>,
        rhs: Box<Formula>,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum UnaryConnective {
    /// Negation.
    Not,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum BinaryConnective {
    /// Conjunction.
    And,

    /// Disjunction.
    Or,

    /// Implication.
    Imp,

    /// Biimplication.
    Biimp,
}

// EXPORT
use crate::export::{self, Export};

impl Export for Formula {
    fn export(&self, settings: export::Settings) -> String {
        match self {
            Formula::Prop(prop) => prop.clone(),
            Formula::Unary { connective, arg } => {
                format!(
                    "{} {}",
                    connective.export(settings.outer()),
                    arg.export(settings.inner())
                )
            }
            Formula::Binary {
                connective,
                lhs,
                rhs,
            } => {
                let binary = format!(
                    "{} {} {}",
                    lhs.export(settings.inner()),
                    connective.export(settings.outer()),
                    rhs.export(settings.inner())
                );
                if settings.outermost {
                    binary
                } else {
                    format!("({binary})")
                }
            }
        }
    }
}

impl Export for UnaryConnective {
    fn export(&self, settings: export::Settings) -> String {
        match self {
            UnaryConnective::Not => match settings.format {
                export::Format::Typst => "not".to_string(),
                export::Format::Latex => r#"\neg"#.to_string(),
            },
        }
    }
}

impl Export for BinaryConnective {
    fn export(&self, settings: export::Settings) -> String {
        match self {
            BinaryConnective::And => match settings.format {
                export::Format::Typst => "and".to_string(),
                export::Format::Latex => r#"\land"#.to_string(),
            },
            BinaryConnective::Or => match settings.format {
                export::Format::Typst => "or".to_string(),
                export::Format::Latex => r#"\lor"#.to_string(),
            },
            BinaryConnective::Imp => match settings.format {
                export::Format::Typst => "->".to_string(),
                export::Format::Latex => r#"\to"#.to_string(),
            },
            BinaryConnective::Biimp => match settings.format {
                export::Format::Typst => "<->".to_string(),
                export::Format::Latex => r#"\leftrightarrow"#.to_string(),
            },
        }
    }
}
