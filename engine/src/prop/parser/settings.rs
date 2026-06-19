#[derive(Debug, Clone, Copy, Default)]
pub struct ParsingSettings {
    pub prop_style: PropStyle,
    pub paren_style: ParenStyle,
}

#[derive(Debug, Clone, Copy, Default)]
pub enum PropStyle {
    /// Proposition symbols are single letters.
    #[default]
    Letter,

    /// Proposition symbols are single uppercase letters.
    UpperLetter,

    /// Proposition symbols are single lowercase letters.
    LowerLetter,

    /// Proposition symbols are C-style identifiers.
    Ident,
}

#[derive(Debug, Clone, Copy, Default)]
pub enum ParenStyle {
    /// Every subformula must be parenthesized.
    Strict,

    /// Outermost parentheses can be omitted.
    #[default]
    Lax,
}
