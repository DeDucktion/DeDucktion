alias c := check
alias fmt := format

dev:
	npm run serve

[working-directory: "engine/wasm-bindings"]
build-engine-bindings:
	wasm-pack build

format: format-engine
	npx @biomejs/biome format --write

[working-directory: "engine"]
format-engine:
	cargo fmt

biome:
	npx @biomejs/biome check --write

check: check-engine
	npx @biomejs/biome check

check-ci: check-engine
	npx @biomejs/biome ci

[working-directory: "engine"]
check-engine:
	cargo fmt --check --all
	cargo check --all

configure-git-hooks:
	git config core.hooksPath scripts/git-hooks
