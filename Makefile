.PHONY: build clean serve lint
.DEFAULT_GOAL: build

build: clean
	zola build

clean:
	rm -rf public

serve:
	zola serve

lint:
	zizmor .
	editorconfig-checker
	flake-checker --no-telemetry
	nix flake check
	zola check
