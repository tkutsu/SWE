#!/usr/bin/env bash
# Builds the app and publishes it to the gh-pages branch, which GitHub Pages
# serves at https://tkutsu.github.io/swe/
#
# The branch holds build output only and is force pushed every time, so it has
# no history worth keeping. Source history lives on main.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
origin="$(git -C "$root" remote get-url origin)"
sha="$(git -C "$root" rev-parse --short HEAD)"

cd "$root/app"
pnpm build

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cp -r dist/. "$tmp/"
# Without this, Pages runs Jekyll and drops any path starting with an underscore.
touch "$tmp/.nojekyll"

cd "$tmp"
git init -q -b gh-pages
git add -A
git commit -q -m "Build from $sha"
git push -qf "$origin" gh-pages

echo "published $sha to gh-pages"
