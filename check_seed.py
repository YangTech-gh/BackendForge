#!/usr/bin/env python3
"""
Backend Forge Seed Verification Script
Checks that all SQL seeds, migrations, and documentation are consistent.

Usage: python3 check_seed.py
"""

import re
import os
import sys
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).parent
SUPABASE = ROOT / "supabase"
MIGRATIONS = SUPABASE / "migrations"
SEED_LABS = SUPABASE / "seed-labs"

errors = []
warnings = []


def err(msg):
    errors.append(msg)
    print(f"  FAIL: {msg}")


def warn(msg):
    warnings.append(msg)
    print(f"  WARN: {msg}")


def ok(msg):
    print(f"  OK: {msg}")


def read_file(path):
    return path.read_text(encoding="utf-8")


def extract_migration_tables():
    """Extract all CREATE TABLE names from migrations."""
    tables = {}
    for f in sorted(MIGRATIONS.glob("*.sql")):
        content = read_file(f)
        for m in re.finditer(
            r"CREATE TABLE IF NOT EXISTS public\.(\w+)\s*\((.*?)\);",
            content, re.DOTALL
        ):
            table_name = m.group(1)
            cols_block = m.group(2)
            cols = []
            for line in cols_block.split("\n"):
                line = line.strip().rstrip(",")
                if not line or line.startswith("--") or line.startswith("CONSTRAINT") or line.startswith("PRIMARY") or line.startswith("FOREIGN") or line.startswith("UNIQUE") or line.startswith("CHECK"):
                    continue
                col_match = re.match(r"(\w+)\s+([\w\s\(\),]+)", line)
                if col_match:
                    cols.append(col_match.group(1))
            tables[table_name] = cols
    return tables


def extract_migration_indexes():
    """Extract all CREATE INDEX names from migrations."""
    indexes = {}
    for f in sorted(MIGRATIONS.glob("*.sql")):
        content = read_file(f)
        for m in re.finditer(
            r"CREATE INDEX IF NOT EXISTS (\w+) ON public\.(\w+)\s*\(([^)]+)\)",
            content
        ):
            idx_name = m.group(1)
            table = m.group(2)
            columns = m.group(3).strip()
            indexes[idx_name] = (table, columns)
    return indexes


def extract_tables_md():
    """Extract table names and columns from TABLES.md."""
    content = read_file(ROOT / "TABLES.md")
    tables = {}
    current_table = None
    in_table = False
    for line in content.split("\n"):
        m = re.match(r"^## (\d+)\. (\w+)", line)
        if m:
            current_table = m.group(2)
            tables[current_table] = []
            in_table = True
            continue
        if in_table and line.startswith("## "):
            in_table = False
            current_table = None
        if in_table and current_table:
            col_match = re.match(r"\| (\w+) \|", line)
            if col_match and col_match.group(1) not in ("Column", "---"):
                tables[current_table].append(col_match.group(1))
    return tables


def extract_tables_md_indexes():
    """Extract indexes from TABLES.md."""
    content = read_file(ROOT / "TABLES.md")
    indexes = {}
    in_indexes = False
    for line in content.split("\n"):
        if "## Indexes" in line:
            in_indexes = True
            continue
        if in_indexes and line.startswith("## "):
            break
        if in_indexes:
            parts = [p.strip() for p in line.split("|") if p.strip()]
            if len(parts) == 3 and not parts[0].startswith("-") and parts[0] not in ("Table", "---"):
                table, idx_name, columns = parts
                indexes[idx_name] = (table, columns)
    return indexes


def extract_seed_tracks():
    """Extract track IDs and track_numbers from seed-tracks.sql."""
    content = read_file(SUPABASE / "seed-tracks.sql")
    tracks = {}
    for m in re.finditer(
        r"\('(track-\d+-[a-z-]+)',\s*(\d+),\s*'([^']+)'",
        content
    ):
        tracks[m.group(1)] = {"number": int(m.group(2)), "title": m.group(3)}
    return tracks


def extract_seed_labs():
    """Extract lab IDs and their track_ids from all track files."""
    labs = {}
    for f in sorted(SEED_LABS.glob("track-*.sql")):
        content = read_file(f)
        for m in re.finditer(
            r"\('(lab-[a-z0-9-]+)',\s*'(track-\d+-[a-z-]+)'",
            content
        ):
            lab_id = m.group(1)
            track_id = m.group(2)
            labs[lab_id] = track_id
    return labs


def extract_seed_kits():
    """Extract kit IDs from seed-starter-kits.sql."""
    content = read_file(SUPABASE / "seed-starter-kits.sql")
    kits = []
    for m in re.finditer(r"\('(kit-[a-z0-9-]+)'", content):
        kits.append(m.group(1))
    return kits


def extract_seed_workshops():
    """Extract workshop IDs from seed-workshops.sql."""
    content = read_file(SUPABASE / "seed-workshops.sql")
    workshops = []
    for m in re.finditer(r"\('(ws-[a-z0-9-]+)'", content):
        workshops.append(m.group(1))
    return workshops


def extract_seed_teardowns():
    """Extract teardown IDs from seed-teardowns.sql."""
    content = read_file(SUPABASE / "seed-teardowns.sql")
    teardowns = []
    for m in re.finditer(r"\('(teardown-[a-z0-9-]+)'", content):
        teardowns.append(m.group(1))
    return teardowns


def extract_edge_function_tables():
    """Extract table references from edge functions."""
    tables = set()
    functions_dir = SUPABASE / "functions"
    if not functions_dir.exists():
        return tables
    for f in functions_dir.rglob("*.ts"):
        content = read_file(f)
        # Match .from("table_name") patterns
        for m in re.finditer(r'\.from\(["\'](\w+)["\']\)', content):
            tables.add((m.group(1), f.name))
        # Match table name in SQL strings
        for m in re.finditer(r'(?:FROM|JOIN|INTO|UPDATE)\s+public\.(\w+)', content):
            tables.add((m.group(1), f.name))
    return tables


def extract_seed_loader_tables():
    """Extract what seed.sql includes."""
    content = read_file(SUPABASE / "seed.sql")
    includes = []
    for m in re.finditer(r"\\i supabase/(\S+)", content):
        includes.append(m.group(1))
    return includes


def check_tables_match(migration_tables, md_tables):
    """Check that all migration tables exist in TABLES.md."""
    print("\n[1] Tables: migrations vs TABLES.md")
    migration_set = set(migration_tables.keys())
    md_set = set(md_tables.keys())

    missing_in_md = migration_set - md_set
    extra_in_md = md_set - migration_set

    for t in sorted(missing_in_md):
        err(f"Table '{t}' in migrations but missing from TABLES.md")
    for t in sorted(extra_in_md):
        warn(f"Table '{t}' in TABLES.md but not in migrations")

    if not missing_in_md and not extra_in_md:
        ok(f"All {len(migration_set)} tables present in both migrations and TABLES.md")


def check_columns_match(migration_tables, md_tables):
    """Check that columns match between migrations and TABLES.md."""
    print("\n[2] Columns: migrations vs TABLES.md")
    mismatches = 0
    for table, mig_cols in migration_tables.items():
        if table not in md_tables:
            continue
        md_cols = md_tables[table]
        # Filter out common non-column entries
        mig_set = set(c for c in mig_cols if c not in ("id",))
        md_set = set(c for c in md_cols if c not in ("Column", "---", "id"))

        missing = mig_set - md_set
        extra = md_set - mig_set

        for c in sorted(missing):
            err(f"Column '{c}' on table '{table}' in migrations but missing from TABLES.md")
            mismatches += 1
        for c in sorted(extra):
            warn(f"Column '{c}' on table '{table}' in TABLES.md but not in migrations")
            mismatches += 1

    if mismatches == 0:
        ok("All columns match between migrations and TABLES.md")


def check_indexes_match(migration_indexes, md_indexes):
    """Check that indexes match between migrations and TABLES.md."""
    print("\n[3] Indexes: migrations vs TABLES.md")
    mig_set = set(migration_indexes.keys())
    md_set = set(md_indexes.keys())

    missing = mig_set - md_set
    extra = md_set - mig_set

    for idx in sorted(missing):
        table, cols = migration_indexes[idx]
        err(f"Index '{idx}' on '{table}' in migrations but missing from TABLES.md")
    for idx in sorted(extra):
        table, cols = md_indexes[idx]
        warn(f"Index '{idx}' on '{table}' in TABLES.md but not in migrations")

    if not missing and not extra:
        ok(f"All {len(mig_set)} indexes match")


def check_track_ids(seeds, labs):
    """Check that track IDs in seed-tracks match seed-labs references."""
    print("\n[4] Track IDs: seed-tracks.sql vs seed-labs references")
    track_ids = set(seeds.keys())
    lab_track_ids = set(labs.values())

    missing = lab_track_ids - track_ids
    extra = track_ids - lab_track_ids

    for tid in sorted(missing):
        lab_count = sum(1 for t in labs.values() if t == tid)
        err(f"Track '{tid}' referenced by {lab_count} labs but missing from seed-tracks.sql")
    for tid in sorted(extra):
        warn(f"Track '{tid}' in seed-tracks.sql but no labs reference it")

    if not missing and not extra:
        ok(f"All {len(track_ids)} track IDs consistent between seeds")


def check_lab_track_numbers(seeds, labs):
    """Check that lab track files use correct track IDs."""
    print("\n[5] Lab track_id references")
    all_valid = True
    for lab_id, track_id in sorted(labs.items()):
        if track_id not in seeds:
            err(f"Lab '{lab_id}' references invalid track '{track_id}'")
            all_valid = False
    if all_valid:
        ok(f"All {len(labs)} labs reference valid track IDs")


def check_seed_loader():
    """Check that seed.sql includes all expected files."""
    print("\n[6] Seed loader (seed.sql)")
    includes = extract_seed_loader_tables()
    expected = [
        "seed-tracks.sql",
        "seed-labs.sql",
        "seed-starter-kits.sql",
        "seed-workshops.sql",
        "seed-teardowns.sql",
    ]
    missing = [f for f in expected if f not in includes]
    extra = [f for f in includes if f not in expected]

    for f in missing:
        err(f"seed.sql missing include: {f}")
    for f in extra:
        warn(f"seed.sql includes unexpected file: {f}")

    if not missing:
        ok("seed.sql includes all expected seed files")


def check_lab_files_exist():
    """Check that all 16 track lab files exist."""
    print("\n[7] Lab track files")
    existing = set(f.name for f in SEED_LABS.glob("track-*.sql"))
    expected = {f"track-{str(i).zfill(2)}.sql" for i in range(1, 22)}

    missing = expected - existing
    extra = existing - expected

    for f in sorted(missing):
        err(f"Missing lab file: seed-labs/{f}")
    for f in sorted(extra):
        warn(f"Unexpected lab file: seed-labs/{f}")

    if not missing:
        ok(f"All {len(expected)} lab track files present")


def check_edge_functions(tables_in_migrations):
    """Check that edge functions reference valid tables."""
    print("\n[8] Edge function table references")
    func_tables = extract_edge_function_tables()
    valid_tables = set(tables_in_migrations.keys())

    for table, func_name in sorted(func_tables):
        if table not in valid_tables:
            err(f"Edge function '{func_name}' references unknown table '{table}'")

    if not func_tables:
        warn("No edge function table references found")
    elif all(t in valid_tables for t, _ in func_tables):
        ok(f"All {len(func_tables)} edge function table references are valid")


def check_kits_count(kits):
    """Check starter kit count matches tracks."""
    print("\n[9] Starter kit count")
    if len(kits) == 21:
        ok(f"21 starter kits (matches 21 tracks)")
    else:
        err(f"Expected 16 starter kits, found {len(kits)}")


def check_lab_count(labs):
    """Check total lab count."""
    print("\n[10] Total lab count")
    count = len(labs)
    if count == 48:
        ok(f"{count} labs total")
    else:
        warn(f"Expected 34 labs, found {count}")


def main():
    print("=" * 60)
    print("Backend Forge Seed Verification")
    print("=" * 60)

    migration_tables = extract_migration_tables()
    migration_indexes = extract_migration_indexes()
    md_tables = extract_tables_md()
    md_indexes = extract_tables_md_indexes()
    seeds = extract_seed_tracks()
    labs = extract_seed_labs()
    kits = extract_seed_kits()
    workshops = extract_seed_workshops()
    teardowns = extract_seed_teardowns()

    print(f"\nMigrations: {len(migration_tables)} tables, {len(migration_indexes)} indexes")
    print(f"TABLES.md:  {len(md_tables)} tables, {len(md_indexes)} indexes")
    print(f"Seeds:      {len(seeds)} tracks, {len(labs)} labs, {len(kits)} kits, {len(workshops)} workshops, {len(teardowns)} teardowns")

    check_tables_match(migration_tables, md_tables)
    check_columns_match(migration_tables, md_tables)
    check_indexes_match(migration_indexes, md_indexes)
    check_track_ids(seeds, labs)
    check_lab_track_numbers(seeds, labs)
    check_seed_loader()
    check_lab_files_exist()
    check_edge_functions(migration_tables)
    check_kits_count(kits)
    check_lab_count(labs)

    print("\n" + "=" * 60)
    if errors:
        print(f"RESULT: {len(errors)} errors, {len(warnings)} warnings")
        print("=" * 60)
        sys.exit(1)
    else:
        print(f"RESULT: ALL CHECKS PASSED ({len(warnings)} warnings)")
        print("=" * 60)
        sys.exit(0)


if __name__ == "__main__":
    main()
