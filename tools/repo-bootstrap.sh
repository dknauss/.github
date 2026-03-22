#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash tools/repo-bootstrap.sh --slug <repo-slug> [options]

Creates a new repository in the local GitHub workspace with the default
portfolio conventions:
  - default branch: main
  - homepage: repo URL unless overridden
  - baseline topics by repo type
  - local checkout at ~/Developer/GitHub/<slug> by default

Options:
  --slug <slug>            Required. Repository slug, e.g. my-project
  --description <text>     Optional repository description
  --type <type>            Repo type: generic, wordpress-plugin, docs, skills, research
  --homepage <url>         Optional homepage override
  --visibility <value>     public or private (default: public)
  --workspace <path>       Local parent dir (default: ~/Developer/GitHub)
  --topic <name>           Extra topic; repeatable
  --dry-run                Print actions without changing anything
  --help                   Show this help

Notes:
  - This script is for new repositories, not forks.
  - Community health files are inherited automatically from dknauss/.github
    unless the new repo adds its own copies later.
EOF
}

require_cmd() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "Missing required command: $cmd" >&2
    exit 1
  }
}

slug=""
description=""
type="generic"
homepage=""
visibility="public"
workspace="${HOME}/Developer/GitHub"
dry_run=0
declare -a extra_topics=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug)
      slug="${2:-}"
      shift 2
      ;;
    --description)
      description="${2:-}"
      shift 2
      ;;
    --type)
      type="${2:-}"
      shift 2
      ;;
    --homepage)
      homepage="${2:-}"
      shift 2
      ;;
    --visibility)
      visibility="${2:-}"
      shift 2
      ;;
    --workspace)
      workspace="${2:-}"
      shift 2
      ;;
    --topic)
      extra_topics+=("${2:-}")
      shift 2
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$slug" ]]; then
  echo "--slug is required" >&2
  usage
  exit 1
fi

case "$visibility" in
  public|private) ;;
  *)
    echo "--visibility must be public or private" >&2
    exit 1
    ;;
esac

declare -a topics=()
case "$type" in
  generic)
    topics=()
    ;;
  wordpress-plugin)
    topics=(wordpress wordpress-plugin php)
    ;;
  docs)
    topics=(documentation)
    ;;
  skills)
    topics=(skills ai developer-tools)
    ;;
  research)
    topics=(research documentation)
    ;;
  *)
    echo "Unsupported --type: $type" >&2
    exit 1
    ;;
esac

if [[ ${#extra_topics[@]} -gt 0 ]]; then
  topics+=("${extra_topics[@]}")
fi

repo_dir="${workspace}/${slug}"
repo_url="https://github.com/dknauss/${slug}"
if [[ -z "$homepage" ]]; then
  homepage="$repo_url"
fi

require_cmd git
require_cmd gh
require_cmd jq

if [[ -e "$repo_dir" ]]; then
  echo "Target path already exists: $repo_dir" >&2
  exit 1
fi

if gh repo view "dknauss/${slug}" >/dev/null 2>&1; then
  echo "GitHub repo already exists: dknauss/${slug}" >&2
  exit 1
fi

repo_title="${slug//-/ }"

if [[ "$dry_run" == "1" ]]; then
  printf 'workspace: %s\n' "$workspace"
  printf 'repo_dir: %s\n' "$repo_dir"
  printf 'repo_url: %s\n' "$repo_url"
  printf 'visibility: %s\n' "$visibility"
  printf 'type: %s\n' "$type"
  printf 'homepage: %s\n' "$homepage"
  printf 'topics: %s\n' "${topics[*]:-<none>}"
  exit 0
fi

mkdir -p "$repo_dir"
cd "$repo_dir"

git init --initial-branch=main

cat > README.md <<EOF
# ${repo_title}

${description:-TODO: add repository description.}
EOF

git add README.md
git commit -m "chore(repo): initialize repository scaffold" >/dev/null

create_args=(repo create "dknauss/${slug}" "--${visibility}" --source=. --remote=origin --push)
if [[ -n "$description" ]]; then
  create_args+=(--description "$description")
fi

gh "${create_args[@]}" >/dev/null
gh repo edit "dknauss/${slug}" --homepage "$homepage" >/dev/null

if [[ ${#topics[@]} -gt 0 ]]; then
  declare -A seen=()
  unique_topics=()
  for topic in "${topics[@]}"; do
    [[ -z "$topic" ]] && continue
    if [[ -z "${seen[$topic]:-}" ]]; then
      seen[$topic]=1
      unique_topics+=("$topic")
    fi
  done

  for topic in "${unique_topics[@]}"; do
    gh repo edit "dknauss/${slug}" --add-topic "$topic" >/dev/null
  done
fi

printf 'Created %s\n' "$repo_url"
printf 'Local checkout: %s\n' "$repo_dir"
printf 'Default branch: main\n'
printf 'Homepage: %s\n' "$homepage"
printf 'Topics: %s\n' "${topics[*]:-<none>}"
