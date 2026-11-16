#!/usr/bin/env bash
# Planted-bug (mutation) check for the Ponytail-Exp todo builds.
#
# Adapted for public use from the original analysis script used in the experiment.
# The 10 mutation scenarios and the pass/fail logic are unchanged. What changed:
# paths are arguments, work happens in a temporary folder that is always removed,
# Vitest caches are disabled so nothing is written into the original apps, and
# sed works on both macOS (BSD) and Linux (GNU).
#
# Usage:   experiment/plant-bugs.sh [PONYTAIL_DIR] [BASELINE_DIR]
# Default: the ponytail/ and baseline/ folders next to this script's parent.
# Needs:   bash, sed, node + npx, and `npm ci` already run in both app folders.
# Expect:  ponytail 4/10 caught (logic only), baseline 10/10 caught.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PONYTAIL_DIR="$(cd "${1:-$ROOT/ponytail}" && pwd)"
BASELINE_DIR="$(cd "${2:-$ROOT/baseline}" && pwd)"

for d in "$PONYTAIL_DIR" "$BASELINE_DIR"; do
  for f in src/todos.ts src/App.tsx package.json vite.config.ts node_modules/.bin/vitest; do
    [ -e "$d/$f" ] || { echo "error: $d/$f not found (run 'npm ci' in $d first)" >&2; exit 1; }
  done
done

TMP="$(mktemp -d "${TMPDIR:-/tmp}/plant-bugs.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT INT TERM

# In-place sed that works with both BSD (macOS) and GNU sed.
sedi() { if sed --version >/dev/null 2>&1; then sed -i "$@"; else sed -i '' "$@"; fi; }

caught=0; total=0
# run LABEL APP_DIR FILE SED_EXPR [sanity]
run() {
  local label="$1" app="$2" file="$3" expr="$4" mode="${5:-}" w="$TMP/work" result
  rm -rf "$w"; mkdir -p "$w"
  cp -R "$app/src" "$app/package.json" "$app/vite.config.ts" "$w/"
  ln -s "$app/node_modules" "$w/node_modules"   # read-only use; caches disabled below
  sedi "$expr" "$w/$file"
  if [ "$mode" != sanity ] && cmp -s "$app/$file" "$w/$file"; then
    printf "  %-34s %s\n" "$label" "MUTANT NOT APPLIED"; return
  fi
  # --configLoader runner: read vite.config.ts without writing a temp file into node_modules
  if (cd "$w" && npx vitest run --no-cache --no-fsModuleCache --configLoader runner >/dev/null 2>&1); then
    result="missed (tests still pass)"
  else
    result="caught"
  fi
  if [ "$mode" = sanity ]; then
    [ "$result" = "missed (tests still pass)" ] || { echo "error: unmodified copy of $app fails its tests" >&2; exit 1; }
    printf "  %-34s %s\n" "$label" "ok (tests pass)"; return
  fi
  total=$((total + 1)); [ "$result" = caught ] && caught=$((caught + 1))
  printf "  %-34s %s\n" "$label" "$result"
}

for role in ponytail baseline; do
  if [ "$role" = ponytail ]; then d="$PONYTAIL_DIR"; id=t.id;    rm=removeTodo
  else                            d="$BASELINE_DIR"; id=todo.id; rm=deleteTodo; fi
  caught=0; total=0
  echo "== $role ($d)"
  run "sanity: unmodified copy"          "$d" src/main.tsx 's/StrictMode/StrictMode/' sanity
  run "L1 no trim"                       "$d" src/todos.ts 's/text: trimmed/text/'
  run "L2 whitespace accepted"           "$d" src/todos.ts "s/if (!trimmed)/if (!text)/; s/if (trimmed === '')/if (text === '')/"
  run "L3 toggle ignores id"             "$d" src/todos.ts "s/$id === id ? /true ? /"
  run "L4 remove keeps only match"       "$d" src/todos.ts "s/$id !== id/$id === id/"
  run "U1 delete button loses name"      "$d" src/App.tsx '/aria-label/d'
  run "U2 input not labelled"            "$d" src/App.tsx 's/htmlFor="new-todo"/htmlFor="nope"/'
  run "U3 Add button doesn't submit"     "$d" src/App.tsx 's#<button>Add</button>#<button type="button">Add</button>#; s#<button type="submit">Add</button>#<button type="button">Add</button>#'
  run "U4 checkbox not labelled by text" "$d" src/App.tsx 's#^\( *\)<label>$#\1<span>#; s#^\( *\)</label>\(.*\)$#\1</span>\2#'
  run "U5 input not cleared after add"   "$d" src/App.tsx "/setText('')/d"
  run "U6 checkbox wired to delete"      "$d" src/App.tsx "s/toggleTodo(prev, $id)/$rm(prev, $id)/"
  echo "  => caught $caught/$total"
done
