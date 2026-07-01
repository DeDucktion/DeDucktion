#[derive(Debug, Clone, Copy, Default)]
pub struct ParsingSettings {
    pub prop_style: PropStyle,
    pub paren_style: ParenStyle,
}

#[derive(Debug, Clone, Copy, Default)]
pub enum PropStyle {
    /// Proposition symbols are single letters.
    Letter,

    /// Proposition symbols are single uppercase letters.
    UpperLetter,

    /// Proposition symbols are single lowercase letters.
    LowerLetter,

    /// Proposition symbols are C-style identifiers.
    Ident,

    /// Proposition symbols are P, Q, or R, optionally followed by digits (e.g. P, Q1, R42).
    #[default]
    PQRIndexed,
}

#[derive(Debug, Clone, Copy, Default)]
pub enum ParenStyle {
    /// Every subformula must be parenthesized.
    #[default]
    Strict,

    /// Outermost parentheses can be omitted.
    Lax,
}
