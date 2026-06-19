pub trait Export {
    fn export(&self, settings: Settings) -> String;
}

#[derive(Debug, Clone, Copy)]
pub struct Settings {
    pub format: Format,
    pub outermost: bool,
}

impl Settings {
    pub fn inner(mut self) -> Self {
        self.outermost = false;
        self
    }

    pub fn outer(mut self) -> Self {
        self.outermost = true;
        self
    }
}

#[derive(Debug, Clone, Copy)]
pub enum Format {
    Typst,
    Latex,
}
