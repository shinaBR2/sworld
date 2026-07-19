---
name: skill-creator
description: Create new skills and iteratively improve existing ones. Use when users want to create a skill from scratch, edit or refine an existing skill, test a skill by running it against realistic prompts, or sharpen a skill's description so it triggers reliably.
---

# Skill Creator

A skill for creating new skills and iteratively improving them.

At a high level, the process goes like this:

- Decide what you want the skill to do and roughly how it should do it
- Write a draft of the skill
- Create a few realistic test prompts and run a subagent-with-access-to-the-skill on them
- Help the user evaluate the results, comparing against a baseline run without the skill
- Rewrite the skill based on the user's feedback and any glaring flaws
- Repeat until you're satisfied

Your job is to figure out where the user is in this process and jump in to help them progress. They might say "I want to make a skill for X" — help narrow down what they mean, write a draft, write test cases, run them, and iterate. Or they might already have a draft, in which case go straight to the test/iterate loop. Always stay flexible: if the user says "I don't need a bunch of evaluations, just vibe with me," do that instead.

## Communicating with the user

Skill authors range widely in familiarity with jargon. Pay attention to context cues and match your phrasing. When in doubt, briefly define a term rather than assume. "Evaluation" and "benchmark" are usually fine; lean on plain language for anything more technical unless the user signals they're comfortable with it.

---

## Creating a skill

### Capture intent

Start by understanding the user's intent. The current conversation might already contain a workflow they want to capture (e.g. "turn this into a skill"). If so, extract what you can from the history first — the tools used, the sequence of steps, corrections the user made, input/output formats observed — then confirm the gaps with the user before moving on.

Get clear on:

1. What should this skill enable Claude to do?
2. When should this skill trigger? (what user phrases / contexts)
3. What's the expected output format?
4. Is it worth setting up test cases? Skills with objectively verifiable outputs (file transforms, data extraction, code generation, fixed workflow steps) benefit from them. Skills with subjective outputs (writing style, design taste) often don't. Suggest the right default for the skill type, but let the user decide.

### Interview and research

Proactively ask about edge cases, input/output formats, example files, success criteria, and dependencies. Iron this out before writing test prompts. If research would help (looking up an API, finding a similar skill, checking best practices), do it — in parallel via subagents where that helps — so you come prepared and reduce the burden on the user.

### Write the SKILL.md

Based on the interview, fill in:

- **name**: Skill identifier (kebab-case, matches the directory name)
- **description**: When to trigger and what it does. This is the primary triggering mechanism — include both what the skill does AND specific contexts for when to use it. All "when to use" info goes here, not in the body. Claude tends to *undertrigger* skills, so make descriptions a little "pushy." Instead of "How to build a fast dashboard to display internal data," write "How to build a fast dashboard to display internal data. Use this whenever the user mentions dashboards, data visualization, metrics, or wants to display any kind of data, even if they don't explicitly say 'dashboard.'"
- **the rest of the skill** :)

### Skill writing guide

#### Skills are modules — treat them exactly like code

**This rule outranks every style preference below.** Manage skills the way this repo manages reusable code: isolated units, a clear API, no leaked internals. Duplication across skills drifts exactly like copy-pasted code drifts, and nothing type-checks it.

- **One owner per concern.** Exactly one skill defines a given thing. If a topic is already owned, extend that skill — do not write a second one that covers part of it. A skill being long is fine; length is never a reason to split. Splitting is justified by a *different concern*, not by size.
- **Consumers call by name and nothing more.** A skill that invokes another names it and states what it's for — the way a caller invokes a method. It must NOT restate the callee's steps, commands, thresholds, tool mechanics, vocabulary, or history. If the callee changes, no consumer should need editing.
- **No private helper promoted to public API.** If a skill exists only to be run by one other skill, it isn't a skill — it's a section of that skill. Fold it in.
- **A cross-reference is one clause.** "Run the `X` skill" or "see `X` for Y". The moment a reference starts explaining *how* X works, the boundary has leaked.

When editing a skill, grep the other skills for its name and check every hit is still a name-only mention. Stale restatements are the failure mode this rule exists to prevent.

#### Anatomy of a skill

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
└── Bundled resources (optional)
    ├── scripts/    - Executable code for deterministic/repetitive tasks
    ├── references/ - Docs loaded into context as needed
    └── assets/     - Files used in output (templates, icons, fonts)
```

If you add bundled resources, make sure they actually ship alongside the SKILL.md — a skill that points at scripts or reference files that aren't there will fail at runtime.

#### Progressive disclosure

Skills load in three levels:

1. **Metadata** (name + description) — always in context (~100 words)
2. **SKILL.md body** — in context whenever the skill triggers (<500 lines ideal)
3. **Bundled resources** — pulled in as needed (scripts can execute without being loaded into context)

These counts are approximate; go longer if you genuinely need to.

Key patterns:
- Keep SKILL.md under ~500 lines. If you're approaching the limit, add a layer of hierarchy with clear pointers about where to look next.
- Reference bundled files clearly from SKILL.md, with guidance on when to read them.
- For large reference files (>300 lines), include a table of contents.

When a skill spans multiple domains/frameworks, organize by variant so Claude reads only the relevant file:

```
cloud-deploy/
├── SKILL.md (workflow + selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

#### One canonical owner (don't duplicate across skills)

A rule, law, or convention lives in exactly ONE skill — its canonical owner. Every other skill that needs it *references it by name* ("see `plain-english`", "placement per `frontend-ui-architecture`") rather than restating the content. Reference it like calling a shared function; never copy the body.

Duplicated rule text drifts — two copies edited independently silently disagree, and the reader can't tell which is authoritative. When you find yourself about to restate another skill's rule, stop and point to it instead. When a rule has no home yet but several skills need it, create the canonical skill first, then wire the references (as `plain-english` did for the jargon-free law, and `frontend-ui-architecture` for UI placement).

#### Principle of lack of surprise

Skills must not contain malware, exploit code, or anything that could compromise security. A skill's contents shouldn't surprise the user given its stated intent. Don't create misleading skills, or skills designed to facilitate unauthorized access, data exfiltration, or other malicious activity. (Harmless things like "roleplay as an X" are fine.)

#### Writing patterns

Prefer the imperative form in instructions.

**Defining output formats:**
```markdown
## Report structure
Always use this exact template:
# [Title]
## Executive summary
## Key findings
## Recommendations
```

**Examples:**
```markdown
## Commit message format
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

**Keep examples evergreen.** An example illustrates a rule — it must not tie the skill to volatile state. No real ticket or PR numbers, dated URLs, or live record IDs: the moment that ticket closes or that record changes, the example is stale and misleads the next reader. Use a generic, self-contained scenario that still reads true a year from now. A concrete example is good; a concrete example anchored to something that will move is a maintenance bug.

**Reuse, don't duplicate.** If a rule already has a canonical home in another skill, reference it rather than copying the text. Duplicated prose drifts — one copy gets refined in a review and the other quietly rots, so the two skills start contradicting each other. Point at the owning skill and spell out only what *this* skill adds on top.

#### Writing style

Explain *why* things matter rather than leaning on heavy-handed MUSTs. Today's models have good theory of mind — given the reasoning behind an instruction, they go beyond rote compliance. If you find yourself writing ALWAYS or NEVER in all caps or reaching for rigid structures, treat it as a yellow flag: reframe and explain the reasoning instead. Keep the skill general rather than overfit to a couple of examples. Write a draft, then read it with fresh eyes and improve it.

---

## Testing the skill

For skills with verifiable outputs, test by running the skill against realistic prompts and comparing to a baseline.

### Write test prompts

After drafting the skill, come up with 2-3 realistic test prompts — the kind of thing a real user would actually say. Share them with the user before running: "Here are a few test cases I'd like to try. Do these look right, or do you want to add more?"

### Run with-skill and baseline together

For each test case, spawn two subagents in the same turn so they finish around the same time:

- **With-skill run:** give the subagent the skill path and the task prompt; have it save outputs somewhere predictable (e.g. a `skill-name-workspace/iteration-1/eval-0/with_skill/` directory).
- **Baseline run:** the same prompt with no skill (for a new skill), or the previous version of the skill (when improving one — snapshot it first with `cp -r` and point the baseline at the snapshot). Save to a sibling `without_skill/` or `old_skill/` directory.

Running both lets you and the user see what the skill actually changes, rather than just whether the output looks plausible.

### Review with the user

Present the with-skill and baseline outputs side by side and ask for feedback. Focus on the cases where the user has specific complaints — silence usually means it's fine. Read the subagent *transcripts*, not just the final outputs: if the skill made the model waste effort or take a worse path, that's a signal to cut or rework part of it.

---

## Improving the skill

This is the heart of the loop. You've run the test cases, the user has reviewed the results, now make the skill better.

How to think about improvements:

1. **Generalize from the feedback.** The goal is a skill that works across countless future prompts, not just the handful you're iterating on. Resist fiddly, overfit changes and oppressive MUSTs. If an issue is stubborn, try a different framing or metaphor — it's cheap to try and you might land on something much better.

2. **Keep the prompt lean.** Remove anything not pulling its weight. If the transcripts show the skill pushing the model toward unproductive work, cut the part causing it and see what happens.

3. **Explain the why.** Even when feedback is terse or frustrated, work out what the user actually needs and why, then transmit that understanding into the instructions. Reasoning beats rigid rules.

4. **Look for repeated work across test cases.** If every test run independently wrote a similar helper script or repeated the same multi-step setup, that's a strong signal to bundle a script once in `scripts/` and have the skill use it — saving every future invocation from reinventing the wheel.

Take your time here; thinking time is cheap. Draft a revision, look at it anew, and improve it.

### The iteration loop

1. Apply your improvements to the skill
2. Rerun all test cases into a new `iteration-<N+1>/` directory, including the baseline
3. Review the new outputs with the user
4. Read the new feedback, improve again, repeat

Keep going until the user is happy, the feedback is all positive, or you're no longer making meaningful progress.

---

## Sharpening the description

The description in the frontmatter is what determines whether Claude invokes the skill, so it's worth getting right.

Understand how triggering works: skills appear in Claude's available-skills list with their name + description, and Claude decides whether to consult one based on that description. Claude only reaches for a skill on tasks it can't easily handle directly — a trivial one-step request ("read this PDF") may not trigger a skill even with a perfect description, while complex, multi-step, or specialized tasks reliably do.

To pressure-test the description, write a handful of realistic queries — a mix of *should-trigger* and *should-not-trigger* — and check whether the description would fire correctly on each. Make them concrete and specific (file paths, real-sounding context, casual phrasing, the odd typo), and make the should-not-trigger cases genuine near-misses that share keywords but need something different. The valuable cases are the ambiguous ones, not the obvious ones. Refine the wording until it catches the should-trigger cases and leaves the near-misses alone, then update the frontmatter and show the user the before/after.
