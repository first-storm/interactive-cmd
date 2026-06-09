#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR_DIR="$ROOT_DIR/vendor"
COREUTILS_DIR="$VENDOR_DIR/coreutils"
DIST_DIR="$ROOT_DIR/dist"
WASM_TARGET="wasm32-wasip1"

if ! command -v rustup >/dev/null 2>&1; then
  echo "error: rustup is required to build uutils for WASI" >&2
  exit 1
fi

mkdir -p "$VENDOR_DIR" "$DIST_DIR"

echo "Checking Rust target: $WASM_TARGET"
rustup target add "$WASM_TARGET"

if [[ ! -d "$COREUTILS_DIR" ]]; then
  echo "Cloning uutils/coreutils into $COREUTILS_DIR"
  git clone https://github.com/uutils/coreutils "$COREUTILS_DIR"
else
  echo "Using existing checkout: $COREUTILS_DIR"
fi

cd "$COREUTILS_DIR"

build_with_profile() {
  local profile="$1"
  echo "Building uutils coreutils with profile: $profile"
  cargo build \
    --target "$WASM_TARGET" \
    --no-default-features \
    --features feat_wasm \
    --profile "$profile"
}

PROFILE="release-small"
if ! build_with_profile "$PROFILE"; then
  echo "release-small profile failed; falling back to --release"
  PROFILE="release"
  cargo build \
    --target "$WASM_TARGET" \
    --no-default-features \
    --features feat_wasm \
    --release
fi

WASM_PATH="$(find "$COREUTILS_DIR/target/$WASM_TARGET/$PROFILE" -maxdepth 2 -type f \( -name 'coreutils.wasm' -o -name 'uu-coreutils.wasm' \) | head -n 1)"

if [[ -z "$WASM_PATH" ]]; then
  echo "error: could not find generated coreutils wasm under target/$WASM_TARGET/$PROFILE" >&2
  exit 1
fi

cp "$WASM_PATH" "$DIST_DIR/uutils.wasm"
echo "Copied $WASM_PATH to $DIST_DIR/uutils.wasm"
