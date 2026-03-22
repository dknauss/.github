#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any


def run(cmd: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)


@dataclass
class RepoStatus:
    name: str
    path: Path
    branch_line: str
    clean: bool
    fsck_ok: bool
    origin: str
    composer_ok: bool | None
    composer_notes: list[str]
    slug: str | None
    default_branch: str | None
    homepage: str | None
    topics: list[str]
    license_graphql: str | None
    community_health: int | None
    community_missing: list[str]


def parse_slug(origin: str) -> str | None:
    if "github.com" not in origin:
      return None
    for marker in ("github.com:", "github.com/"):
        if marker in origin:
            slug = origin.split(marker, 1)[1]
            if slug.endswith(".git"):
                slug = slug[:-4]
            return slug
    return None


def gh_repo_view(slug: str) -> dict[str, Any] | None:
    result = run(
        [
            "gh",
            "repo",
            "view",
            slug,
            "--json",
            "defaultBranchRef,homepageUrl,licenseInfo,repositoryTopics",
        ]
    )
    if result.returncode != 0:
        return None
    return json.loads(result.stdout)


def gh_community_profile(slug: str) -> dict[str, Any] | None:
    result = run(["gh", "api", f"repos/{slug}/community/profile"])
    if result.returncode != 0:
        return None
    return json.loads(result.stdout)


def audit_repo(path: Path) -> RepoStatus:
    branch_result = run(["git", "status", "--short", "--branch"], cwd=path)
    branch_line = branch_result.stdout.splitlines()[0].strip() if branch_result.stdout else "UNKNOWN"
    porcelain = run(["git", "status", "--porcelain"], cwd=path)
    fsck_ok = run(["git", "fsck", "--connectivity-only"], cwd=path).returncode == 0
    origin = run(["git", "remote", "get-url", "origin"], cwd=path).stdout.strip()

    composer_ok: bool | None = None
    composer_notes: list[str] = []
    if (path / "composer.json").exists():
        composer = run(["composer", "validate", "--no-check-publish"], cwd=path)
        composer_ok = composer.returncode == 0
        merged = (composer.stdout + "\n" + composer.stderr).splitlines()
        composer_notes = [
            line.strip()
            for line in merged
            if line.strip() and " is valid" not in line
        ][:6]

    slug = parse_slug(origin)
    default_branch = None
    homepage = None
    topics: list[str] = []
    license_graphql = None
    community_health = None
    community_missing: list[str] = []

    if slug:
        repo_data = gh_repo_view(slug)
        if repo_data:
            default_branch = (repo_data.get("defaultBranchRef") or {}).get("name")
            homepage = repo_data.get("homepageUrl") or None
            topics = [t.get("name", "") for t in (repo_data.get("repositoryTopics") or []) if isinstance(t, dict)]
            license_info = repo_data.get("licenseInfo") or {}
            license_graphql = license_info.get("spdxId") if isinstance(license_info, dict) else None

        community = gh_community_profile(slug)
        if community:
            community_health = community.get("health_percentage")
            files = community.get("files") or {}
            local_issue_templates = path / ".github" / "ISSUE_TEMPLATE"
            local_has_issue_templates = local_issue_templates.exists() and any(local_issue_templates.iterdir())
            local_license_exists = any((path / name).exists() for name in ["LICENSE", "LICENSE.md", "LICENSE.txt", "COPYING"])
            for key in [
                "code_of_conduct",
                "code_of_conduct_file",
                "contributing",
                "issue_template",
                "pull_request_template",
                "license",
                "readme",
            ]:
                if key == "issue_template" and local_has_issue_templates:
                    continue
                if key == "license" and local_license_exists:
                    continue
                if not files.get(key):
                    community_missing.append(key)

    return RepoStatus(
        name=path.name,
        path=path,
        branch_line=branch_line,
        clean=(porcelain.stdout.strip() == ""),
        fsck_ok=fsck_ok,
        origin=origin or "NO_ORIGIN",
        composer_ok=composer_ok,
        composer_notes=composer_notes,
        slug=slug,
        default_branch=default_branch,
        homepage=homepage,
        topics=topics,
        license_graphql=license_graphql,
        community_health=community_health,
        community_missing=community_missing,
    )


def summarize(repos: list[RepoStatus]) -> tuple[str, list[str]]:
    findings: list[str] = []

    dirty = [repo for repo in repos if not repo.clean]
    fsck_fail = [repo for repo in repos if not repo.fsck_ok]
    composer_warn = [repo for repo in repos if repo.composer_ok is False]
    missing_homepage = [repo for repo in repos if repo.slug and not repo.homepage]
    sparse_topics = [repo for repo in repos if repo.slug and len(repo.topics) == 0]

    if fsck_fail:
        findings.append(f"{len(fsck_fail)} repo(s) failed git fsck")
    if dirty:
        findings.append(f"{len(dirty)} repo(s) have uncommitted changes")
    if composer_warn:
        findings.append(f"{len(composer_warn)} repo(s) failed composer validation")
    if missing_homepage:
        findings.append(f"{len(missing_homepage)} repo(s) are missing a homepage URL")
    if sparse_topics:
        findings.append(f"{len(sparse_topics)} repo(s) have no topics")

    if fsck_fail or dirty or composer_warn:
        overall = "red"
    elif missing_homepage or sparse_topics:
        overall = "yellow"
    else:
        overall = "green"

    return overall, findings


def render_markdown(repos: list[RepoStatus], workspace: Path) -> str:
    overall, findings = summarize(repos)
    lines: list[str] = []
    lines.append("# Repo Health Audit")
    lines.append("")
    lines.append(f"- Workspace: `{workspace}`")
    lines.append(f"- Overall: `{overall}`")
    lines.append(f"- Repos scanned: `{len(repos)}`")
    lines.append("")

    if findings:
        lines.append("## Findings")
        for finding in findings:
            lines.append(f"- {finding}")
        lines.append("")

    lines.append("## Status")
    lines.append("")
    lines.append("| Repo | Branch | Clean | Fsck | Composer | Homepage | Topics | Community |")
    lines.append("|---|---|---:|---:|---:|---|---:|---:|")
    for repo in repos:
        composer = "n/a" if repo.composer_ok is None else ("ok" if repo.composer_ok else "warn")
        homepage = "set" if repo.homepage else "missing"
        topics = str(len(repo.topics))
        community = str(repo.community_health) if repo.community_health is not None else "n/a"
        lines.append(
            f"| `{repo.name}` | `{repo.branch_line}` | {'yes' if repo.clean else 'no'} | "
            f"{'ok' if repo.fsck_ok else 'fail'} | {composer} | {homepage} | {topics} | {community} |"
        )
    lines.append("")

    detail_repos = [repo for repo in repos if not repo.clean or not repo.fsck_ok or repo.composer_notes or repo.community_missing]
    if detail_repos:
        lines.append("## Details")
        lines.append("")
        for repo in detail_repos:
            lines.append(f"### `{repo.name}`")
            lines.append(f"- Path: `{repo.path}`")
            if not repo.clean:
                lines.append("- Worktree: dirty")
            if not repo.fsck_ok:
                lines.append("- Git fsck: failed")
            if repo.composer_notes:
                lines.append("- Composer:")
                for note in repo.composer_notes:
                    lines.append(f"  - {note}")
            if repo.community_missing:
                lines.append(f"- Community profile missing: `{', '.join(repo.community_missing)}`")
            lines.append("")

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit repo health across a local GitHub workspace.")
    parser.add_argument(
        "--workspace",
        default=str(Path.home() / "Developer" / "GitHub"),
        help="Path containing sibling git repositories",
    )
    parser.add_argument(
        "--output",
        help="Optional path to write the Markdown report",
    )
    args = parser.parse_args()

    workspace = Path(args.workspace).expanduser().resolve()
    repos_by_realpath: dict[Path, Path] = {}
    for path in workspace.iterdir():
        if not (path.is_dir() and (path / ".git").exists()):
            continue
        real_path = path.resolve()
        repos_by_realpath.setdefault(real_path, real_path)

    repos = sorted(repos_by_realpath.values(), key=lambda item: item.name.lower())

    report = render_markdown([audit_repo(repo) for repo in repos], workspace)

    if args.output:
        output_path = Path(args.output).expanduser().resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(report + "\n")
    else:
        print(report)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
