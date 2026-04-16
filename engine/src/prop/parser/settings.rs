#[derive(Debug, Clone, Copy, Default)]
pub struct ParsingSettings {
    pub variable_style: VariableStyle,
    pub parenthesization_style: ParenthesizationStyle,
}

#[derive(Debug, Clone, Copy, Default)]
pub enum VariableStyle {
    /// Variables are single letters
    #[default]
    Letter,

    /// Variables are single uppercase letters
    UpperLetter,

    /// Variables are single lowercase letters
    LowerLetter,

    /// Variables are C-style identifiers
    Ident,
}

#[derive(Debug, Clone, Copy, Default)]
pub enum ParenthesizationStyle {
    /// Every subformula must be parenthesized
    Strict,

    /// Outermost parentheses can be omitted
    #[default]
    Lax,
}
