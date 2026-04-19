#!/usr/bin/env python3
"""
Compare the 250 Vault techniques against the live Supabase knowledge_chunks
table. Reports which vault technique names ARE in the DB (match) and which
are NOT (gap candidates for later ingestion).

Matching strategy:
  - Normalize names (lowercase, remove punctuation, collapse whitespace)
  - Check DB technique_name column against each vault technique
  - Also check fuzzy (substring / stem) match as a secondary signal
"""

import os
import re
import sys
import json
from pathlib import Path
from urllib import request, parse, error

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from vault_techniques import PARTS as PARTS_1
from vault_parts_2_5 import PARTS_2_5
from vault_parts_6_10 import PARTS_6_10
ALL_PARTS = PARTS_1 + PARTS_2_5 + PARTS_6_10

# Load env
def load_env():
    env_path = HERE.parents[1] / ".env.local"
    vars_ = {}
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                vars_[k.strip()] = v.strip().strip('"').strip("'")
    return vars_

ENV = load_env()
SUPABASE_URL = ENV.get("NEXT_PUBLIC_SUPABASE_URL", "https://zpedstfjphsyfvjkgexg.supabase.co")
SERVICE_KEY = ENV.get("SUPABASE_SERVICE_ROLE_KEY", "")

def fetch_all_technique_names():
    """Pull distinct technique_name values from knowledge_chunks via REST."""
    if not SERVICE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY missing from .env.local")
        sys.exit(1)

    # Page through since Supabase REST has a row limit
    all_names = set()
    offset = 0
    page_size = 1000

    while True:
        url = (f"{SUPABASE_URL}/rest/v1/knowledge_chunks"
               f"?select=technique_name"
               f"&technique_name=not.is.null"
               f"&limit={page_size}&offset={offset}")
        req = request.Request(url, headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Accept": "application/json",
        })
        try:
            with request.urlopen(req, timeout=30) as resp:
                rows = json.loads(resp.read())
        except error.HTTPError as e:
            print(f"HTTP error {e.code}: {e.read().decode()[:200]}")
            sys.exit(1)

        if not rows:
            break
        for row in rows:
            n = row.get("technique_name")
            if n:
                all_names.add(n)
        if len(rows) < page_size:
            break
        offset += page_size
        print(f"  ...fetched {offset} rows, {len(all_names)} unique names so far")

    return all_names


def normalize(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def tokens(s: str) -> set:
    return set(normalize(s).split())


def main():
    print(f"Fetching technique names from {SUPABASE_URL}...")
    db_names = fetch_all_technique_names()
    print(f"Pulled {len(db_names)} unique technique names from DB\n")

    db_norm = {normalize(n): n for n in db_names}
    db_tokens_list = [(n, tokens(n)) for n in db_names]

    # Collect all 250 vault technique names
    vault = []
    tnum = 1
    for part in ALL_PARTS:
        for tech in part["techniques"]:
            vault.append({
                "num": tnum,
                "name": tech["name"],
                "category": tech["category"],
                "part": part["num"],
                "part_title": part["title"],
            })
            tnum += 1

    # Classify each vault technique
    matched = []
    fuzzy = []
    missing = []

    for t in vault:
        norm = normalize(t["name"])
        # Exact (normalized) match
        if norm in db_norm:
            matched.append({**t, "db_match": db_norm[norm], "match_type": "exact"})
            continue

        # Fuzzy: drop stopwords, then use containment + jaccard + substring
        STOP = {"the", "a", "an", "of", "to", "and", "your", "their", "them",
                "it", "is", "you", "or", "for", "with", "in", "on",
                "s", "without"}
        my_tokens = tokens(t["name"]) - STOP
        best_score = 0.0
        best_match = None
        for db_name, db_t_raw in db_tokens_list:
            db_t = db_t_raw - STOP
            if not my_tokens or not db_t:
                continue
            inter = len(my_tokens & db_t)
            # containment: what fraction of the smaller set appears in the larger
            min_size = min(len(my_tokens), len(db_t))
            containment = inter / min_size if min_size else 0
            # jaccard
            union = len(my_tokens | db_t)
            jac = inter / union if union else 0
            # substring match on normalized strings
            sub = 0.6 if (norm in normalize(db_name) or normalize(db_name) in norm) else 0
            score = max(containment, jac, sub)
            if score > best_score:
                best_score = score
                best_match = db_name

        if best_score >= 0.6:
            fuzzy.append({**t, "db_match": best_match, "score": round(best_score, 2), "match_type": "fuzzy"})
        else:
            missing.append(t)

    # === Report ===
    print("=" * 70)
    print("VAULT  vs  SUPABASE DATABASE  COMPARISON")
    print("=" * 70)
    print(f"Vault techniques:       {len(vault)}")
    print(f"DB unique techniques:   {len(db_names)}")
    print()
    print(f"\u2714 Exact matches:        {len(matched)}  ({100*len(matched)/len(vault):.1f}%)")
    print(f"\u2248 Fuzzy matches:        {len(fuzzy)}    ({100*len(fuzzy)/len(vault):.1f}%)")
    print(f"\u2718 Missing from DB:      {len(missing)} ({100*len(missing)/len(vault):.1f}%)")
    print()

    out_path = HERE / "vault-db-comparison.md"
    with out_path.open("w") as f:
        f.write("# Vault vs Database Comparison\n\n")
        f.write(f"- Vault techniques: **{len(vault)}**\n")
        f.write(f"- DB unique techniques: **{len(db_names)}**\n")
        f.write(f"- Exact matches: **{len(matched)}** ({100*len(matched)/len(vault):.1f}%)\n")
        f.write(f"- Fuzzy matches (likely same concept, different name): **{len(fuzzy)}** ({100*len(fuzzy)/len(vault):.1f}%)\n")
        f.write(f"- Missing from DB (candidates to ingest): **{len(missing)}** ({100*len(missing)/len(vault):.1f}%)\n\n")
        f.write("---\n\n")

        f.write("## MISSING — Candidates To Add To Your SaaS\n\n")
        f.write("These vault techniques have no obvious equivalent in your knowledge_chunks table.\n\n")
        # Group by part
        for part in ALL_PARTS:
            part_missing = [t for t in missing if t["part"] == part["num"]]
            if not part_missing:
                continue
            f.write(f"### Part {part['num']:02d} — {part['title']}  ({len(part_missing)} missing)\n\n")
            for t in part_missing:
                f.write(f"- #{t['num']:03d}  **{t['name']}**  ({t['category']})\n")
            f.write("\n")

        f.write("---\n\n")
        f.write("## FUZZY MATCHES — Review Manually\n\n")
        f.write("These might already exist under a different name. Check and decide.\n\n")
        for t in fuzzy:
            f.write(f"- #{t['num']:03d}  **{t['name']}**  \u2248  `{t['db_match']}`  (score {t['score']})\n")

        f.write("\n---\n\n")
        f.write("## EXACT MATCHES — Already In Your DB\n\n")
        for t in matched:
            f.write(f"- #{t['num']:03d}  **{t['name']}**  \u2192  `{t['db_match']}`\n")

    print(f"Full report saved: {out_path}")
    print(f"\nTop 10 MISSING (highest priority to add to SaaS):")
    for t in missing[:10]:
        print(f"  #{t['num']:03d} [Part {t['part']:02d}]  {t['name']} ({t['category']})")


if __name__ == "__main__":
    main()
