---
name: secretsanta-config
description: Create a Secret Santa configuration under secretsanta/u/<slug>, optionally copying an existing configuration, editing participant exclusions, and choosing a random seed.
---

# Create a Secret Santa configuration

Use this skill when asked to add a new configuration for the Secret Santa app. Perform the workflow interactively; do not create or overwrite files until the user has supplied the configuration details and confirmed the proposed seed.

## Repository contract

- Each configuration lives at `secretsanta/u/<slug>/config.json`.
- Each slug also needs `secretsanta/u/<slug>/index.html`. This is the same redirect page for every configuration; copy it unchanged from an existing `secretsanta/u/*/index.html`.
- Config JSON has a `participants` object mapping each participant name to an array of names they must not draw, plus a numeric `seed`.
- The slug is used in a URL path and must match `^[A-Za-z0-9_-]+$`. Never overwrite an existing slug.

## Workflow

1. Discover the current configuration set by listing `secretsanta/u/*/config.json`. Treat each parent directory name as an available source slug; do not rely on a hard-coded list.
2. Ask for the new slug. Propose the current calendar year (`YYYY`, e.g. `2026`) as the default. If that path already exists, explain the collision and propose an unused slug, such as `<year>-2`; never silently overwrite.
3. Ask whether to copy an existing configuration. Offer a separate choice for every discovered configuration, with its slug, plus a blank configuration choice. If there are no existing configurations, use a blank configuration. For a selected source, copy its participant names and exclusion arrays as the starting point; do not carry over its seed.
4. Inspect the selected starting configuration and ask what to modify. The user can add/remove/rename participants and change exclusions. Apply only their requested changes. If starting blank, collect the full participant/exclusion mapping. Preserve JSON-compatible strings and arrays; do not invent participant details.
5. Generate a fresh seed securely and offer it as the default in a seed confirmation prompt. Use Python's cryptographically secure `secrets` module, for example:

   ```bash
   python3 -c 'import secrets; print(secrets.randbelow(2147483648))'
   ```

   This yields an integer in `[0, 2147483647]`, accepted by the app's numeric seed handling. Do not use timestamps, ordinary pseudo-random generators, or a remembered/example seed. Always generate and propose a new value, including when cloning. Let the user accept it or enter another integer.
6. Once the slug, participant changes, and seed are settled—but before writing files—inspect the worktree and create a new branch named exactly `secretsanta-<slug>`. If that branch already exists locally or remotely, do not reuse it or switch away from the user's current branch; ask for a different slug. Keep unrelated worktree changes out of the eventual commit and PR.
7. Create the new slug directory with `config.json` and the unchanged shared redirect `index.html`. Keep the JSON shape exactly:

   ```json
   {
     "participants": {
       "Name": ["Excluded Name"]
     },
     "seed": 123
   }
   ```

   Empty exclusion lists are `[]`. Serialize valid JSON with readable indentation. Do not add a per-slug copy of the app's root `index.html`.
8. Verify the resulting JSON parses, the slug is URL-safe and unused, and the new redirect page matches the existing redirect template. Commit only the two new files; never include unrelated user changes. Follow the repository's commit conventions.
9. Create a pull request from `secretsanta-<slug>` using the repository's PR conventions. Determine any required ticket key/title format from repository guidance or existing PRs; ask the user only if required information cannot be resolved from the repository. Do not merge the PR.
10. Open the created PR URL in the user's default browser using the normal default-browser integration; do not launch or switch to a separate managed, headless, or alternate browser. If the default browser is unavailable, report the PR URL and that it could not be opened there rather than falling back. Report the branch, PR URL, created paths, and seed. Do not claim approval or merge unless the user performs that action.

## Interaction requirements

- Use a prompt for the slug, a prompt to choose the source configuration, a prompt for modifications, and a prompt to accept/change the generated seed. Do not bundle these into one prompt that hides later choices.
- When asking which configuration to copy, show every discovered configuration as an individual option; do not select one silently, even when there are many.
- Do not ask for approval to copy the shared redirect page; it must remain identical across slugs.
- If a requested change would leave an invalid participant/exclusion mapping, explain the specific inconsistency and ask how to resolve it before writing files.
- Create the branch only after the user has confirmed configuration details and the seed; create the pull request only after the new configuration is verified and committed.
- Open the actual pull request URL in the browser and leave it unmerged for the user's review.

