{
	description = "Personal website";

	inputs = {
		# Commit does not correspond to a tag.
		# Updating to latest commit generally follows unstable branch.
		nixpkgs.url = "github:NixOS/nixpkgs/0feafdbc84139a414f5d46a11cf91fc4fcd85ffb";
		# Commit does not correspond to a tag.
		flake-parts.url = "github:hercules-ci/flake-parts/9305fe4e5c2a6fcf5ba6a3ff155720fbe4076569";
		flake-checker = {
			# Commit corresponds to tag v0.2.7.
			url = "github:DeterminateSystems/flake-checker/fc0d03efe300c1e923158831fd6d0a84d3ef75d3";
			inputs.nixpkgs.follows = "nixpkgs";
		};
	};

	outputs = inputs@{self, nixpkgs, flake-parts, flake-checker}: flake-parts.lib.mkFlake {inherit inputs;} {
		systems = ["aarch64-darwin" "aarch64-linux" "x86_64-linux" "x86_64-darwin"];
		perSystem = {pkgs, system, ...}:
			let
				flakeCheckerPackage = flake-checker.packages.${system}.default;
			in {
				devShells.default = pkgs.mkShellNoCC {
					nativeBuildInputs = [flakeCheckerPackage] ++ (with pkgs; [zola editorconfig-checker zizmor trufflehog]);
				};

				devShells.lintWorkflows = pkgs.mkShellNoCC {
					nativeBuildInputs = with pkgs; [zizmor];
				};

				devShells.lintEditorconfig = pkgs.mkShellNoCC {
					nativeBuildInputs = with pkgs; [editorconfig-checker];
				};

				devShells.scanSecrets = pkgs.mkShellNoCC {
					nativeBuildInputs = with pkgs; [trufflehog];
				};
			};
	};
}
