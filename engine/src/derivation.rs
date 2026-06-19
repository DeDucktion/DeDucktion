use serde::{Deserialize, Serialize};

use crate::export::{self, Export};

/// An unparsed derivation tree with [String] nodes.
pub type RawDerivation = GenericDerivation<Option<String>, Option<String>>;

/// A generic derivation tree over some judgement type `J` and some rule type `R`.
#[derive(Debug, Serialize, Deserialize)]
pub struct GenericDerivation<J, R> {
    pub rule: R,
    pub premises: Vec<GenericDerivation<J, R>>,
    pub conclusion: J,
}

impl<J, R> Export for GenericDerivation<J, R>
where
    J: Export,
    R: Export,
{
    fn export(&self, settings: export::Settings) -> String {
        match settings.format {
            export::Format::Typst => {
                // We use [curryst](https://typst.app/universe/package/curryst/).

                if self.premises.is_empty() {
                    return format!("{}", self.conclusion.export(settings.outer()));
                }

                let premises: Vec<String> = self
                    .premises
                    .iter()
                    .map(|premise| premise.export(settings.inner()))
                    .collect();

                let rule = format!(
                    "rule(name: {}, {}, {})",
                    self.rule.export(settings.outer()),
                    premises.join(", "),
                    self.conclusion.export(settings.outer())
                );

                if settings.outermost {
                    format!("#prooftree({rule})")
                } else {
                    rule
                }
            }
            export::Format::Latex => {
                // We use [bussproofs](https://ctan.org/pkg/bussproofs).

                if self.premises.is_empty() {
                    return format!(r#"\AxiomC{{{}}}"#, self.conclusion.export(settings.outer()));
                }

                let premises: Vec<String> = self
                    .premises
                    .iter()
                    .map(|premise| premise.export(settings.inner()))
                    .collect();

                let arity_command = match premises.len() {
                    0 => r#"\AxiomC"#,
                    1 => r#"\UnaryInfC"#,
                    2 => r#"\BinaryInfC"#,
                    3 => r#"\TrinaryInfC"#,
                    // unsupported, but better not to panic.
                    _ => "",
                };

                let rule = format!(
                    "{}\n\\RightLabel{{{}}}\n{}{{{}}}",
                    premises.join("\n"),
                    self.rule.export(settings.outer()),
                    arity_command,
                    self.conclusion.export(settings.outer())
                );

                if settings.outermost {
                    format!("\\begin{{prooftree}}\n{rule}\n\\end{{prooftree}}")
                } else {
                    rule
                }
            }
        }
    }
}
