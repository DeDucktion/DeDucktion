{
  description = "DeDucktion - a proof editor and validator for Gentzen-style calculi";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          name = "deducktion";
          packages = with pkgs; [
            nodejs
            vscode-langservers-extracted
            typescript-language-server
            rustc
            cargo
            clippy
            rustfmt
            rust-analyzer
            wasm-pack
            lld
          ];
        };
      }
    );
}
