import { createLazyFileRoute, Link } from '@tanstack/react-router';

/**
 * Standalone /about page — a personal CV for Vincent Tran.
 *
 * Styling is intentionally co-located here as a scoped <style> block
 * (namespaced under `.cv-about`, Graphite theme only, light/dark via
 * prefers-color-scheme). This is a deliberate one-time app-CSS hack; the
 * reusable pieces (impact ledger, capability cards) get lifted into
 * packages/ui with MUI in a follow-up (see SWO-643).
 */

const styles = `
.cv-about {
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --serif: "Iowan Old Style", "Palatino Linotype", Palatino, "URW Palladio L", Georgia, serif;
  --mono: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --measure: 40rem;
  --step-0: 1rem; --step-1: 1.15rem; --step-2: 1.45rem; --step-5: clamp(2.8rem, 7vw, 4.6rem);

  --paper:#F5F4F1; --raised:#FBFAF8; --ink:#1B1D21; --muted:#5E626B; --faint:#9A9CA1;
  --rule:#DEDCD6; --rule-strong:#C9C7C0; --accent:#3E6E8E; --accent-soft:rgba(62,110,142,0.10); --signal:#3E6E8E;

  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: var(--step-0);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
@media (prefers-color-scheme: dark) {
  .cv-about {
    --paper:#111316; --raised:#171A1E; --ink:#E9E9E6; --muted:#9AA0A8; --faint:#666A72;
    --rule:#262A2F; --rule-strong:#333840; --accent:#6FA2C4; --accent-soft:rgba(111,162,196,0.15); --signal:#6FA2C4;
  }
}

.cv-about *, .cv-about *::before, .cv-about *::after { box-sizing: border-box; }
.cv-about .wrap { max-width: 56rem; margin: 0 auto; padding: clamp(2.5rem, 6vw, 6rem) clamp(1.5rem, 5vw, 3.5rem) 5rem; }

.cv-about .eyebrow { font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin: 0; }

.cv-about a { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--accent-soft); transition: border-color .18s ease; }
.cv-about a:hover { border-color: var(--accent); }
.cv-about a:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px; }

.cv-about .hero { margin-bottom: clamp(3rem, 7vw, 5rem); }
.cv-about .name { font-family: var(--sans); font-weight: 800; font-size: var(--step-5); line-height: 1.02; letter-spacing: -0.03em; margin: 1rem 0 0.4rem; text-wrap: balance; }
.cv-about .handle { font-family: var(--mono); font-size: 0.82rem; color: var(--muted); letter-spacing: 0.02em; margin: 0 0 2rem; }
.cv-about .handle a { border: none; color: var(--muted); }
.cv-about .handle a:hover { color: var(--accent); }
.cv-about .thesis { font-size: var(--step-2); line-height: 1.5; font-weight: 400; max-width: 34rem; margin: 0; text-wrap: pretty; }
.cv-about .thesis b { font-weight: 700; color: var(--ink); }
.cv-about .thesis .del { color: var(--signal); font-weight: 600; }

.cv-about section { margin-top: clamp(3.2rem, 7vw, 5rem); }
.cv-about .sec-head { display: flex; align-items: baseline; gap: 1rem; border-bottom: 1px solid var(--rule); padding-bottom: 0.7rem; margin-bottom: 1.8rem; }
.cv-about .sec-head .num { font-family: var(--mono); font-size: 0.72rem; color: var(--faint); letter-spacing: 0.05em; }
.cv-about .sec-head h2 { font-family: var(--sans); font-weight: 700; font-size: var(--step-2); letter-spacing: -0.01em; margin: 0; }
.cv-about .sec-head .aside { margin-left: auto; font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--faint); }

.cv-about p { max-width: var(--measure); }
.cv-about .lead { font-size: var(--step-1); line-height: 1.6; }
.cv-about .muted { color: var(--muted); }

.cv-about .questions { list-style: none; padding: 0; margin: 1.4rem 0 0; max-width: var(--measure); counter-reset: q; }
.cv-about .questions li { counter-increment: q; display: flex; gap: 1rem; align-items: baseline; padding: 0.9rem 0; border-bottom: 1px solid var(--rule); }
.cv-about .questions li:last-child { border-bottom: none; }
.cv-about .questions li::before { content: counter(q, decimal-leading-zero); font-family: var(--mono); font-size: 0.72rem; color: var(--accent); flex: none; padding-top: 0.15rem; }
.cv-about .questions li span { font-size: var(--step-1); font-weight: 500; }

.cv-about .strengths { display: flex; flex-direction: column; gap: 2rem; }
.cv-about .strength { max-width: var(--measure); }
.cv-about .strength .tag { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); }
.cv-about .strength h3 { font-family: var(--sans); font-weight: 700; font-size: var(--step-1); margin: 0.35rem 0 0.5rem; letter-spacing: -0.01em; }
.cv-about .strength p { margin: 0; color: var(--muted); }
.cv-about .strength p b { color: var(--ink); font-weight: 600; }

.cv-about .subhead { font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--faint); margin: 2.8rem 0 1.4rem; padding-top: 1.6rem; border-top: 1px solid var(--rule); max-width: var(--measure); }

.cv-about .systems { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem 2rem; max-width: var(--measure); }
.cv-about .system h4 { font-family: var(--sans); font-weight: 700; font-size: 0.98rem; margin: 0 0 0.3rem; }
.cv-about .system p { font-size: 0.88rem; color: var(--muted); margin: 0; line-height: 1.5; }

.cv-about .quotes { display: flex; flex-direction: column; gap: 1.6rem; margin-top: 1.6rem; max-width: var(--measure); }
.cv-about blockquote { margin: 0; padding-left: 1.3rem; border-left: 2px solid var(--accent); }
.cv-about blockquote p { font-family: var(--serif); font-size: var(--step-1); line-height: 1.5; font-style: italic; margin: 0 0 0.4rem; color: var(--ink); }
.cv-about blockquote cite { font-family: var(--mono); font-size: 0.72rem; font-style: normal; letter-spacing: 0.04em; color: var(--muted); }

.cv-about .project { max-width: var(--measure); }
.cv-about .project + .project { margin-top: 2.8rem; padding-top: 2.6rem; border-top: 1px solid var(--rule); }
.cv-about .project-kind { font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 0.5rem; }
.cv-about .project-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.3rem 1rem; }
.cv-about .project-name { font-family: var(--sans); font-weight: 700; font-size: var(--step-1); letter-spacing: -0.01em; margin: 0; }
.cv-about .project-meta { font-family: var(--mono); font-size: 0.72rem; color: var(--faint); letter-spacing: 0.03em; }
.cv-about .project-desc { margin: 0.7rem 0 0; color: var(--muted); }

.cv-about .ledger { margin-top: 1.6rem; border-top: 1px solid var(--rule-strong); display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.cv-about .ledger .cell { padding: 1.5rem 1.4rem 1.5rem 0; border-bottom: 1px solid var(--rule); }
.cv-about .ledger .cell + .cell { padding-left: 1.4rem; border-left: 1px solid var(--rule); }
.cv-about .fig { font-family: var(--mono); font-weight: 600; font-size: clamp(1.9rem, 4.5vw, 2.6rem); letter-spacing: -0.02em; color: var(--signal); font-variant-numeric: tabular-nums; line-height: 1; display: block; }
.cv-about .fig .u { font-size: 0.5em; color: var(--muted); letter-spacing: 0; }
.cv-about .fig-label { display: block; margin-top: 0.7rem; font-size: 0.82rem; color: var(--ink); font-weight: 600; line-height: 1.35; }
.cv-about .fig-sub { display: block; margin-top: 0.3rem; font-family: var(--mono); font-size: 0.7rem; color: var(--faint); letter-spacing: 0.01em; }

.cv-about .evidence { list-style: none; padding: 0; margin: 1.3rem 0 0; display: flex; flex-direction: column; gap: 0.55rem; border-left: 2px solid var(--rule-strong); padding-left: 1.1rem; }
.cv-about .evidence li { font-size: 0.92rem; color: var(--muted); line-height: 1.5; }
.cv-about .evidence li b { color: var(--ink); font-weight: 600; }

.cv-about .ledger-note, .cv-about .demonstrates { font-family: var(--mono); font-size: 0.72rem; color: var(--faint); letter-spacing: 0.01em; }
.cv-about .ledger-note { margin: 0.9rem 0 0; }
.cv-about .demonstrates { margin: 1.2rem 0 0; }
.cv-about .demonstrates b { color: var(--accent); }

.cv-about .tech { margin-top: clamp(3rem, 6vw, 4.5rem); padding-top: 1.4rem; border-top: 1px solid var(--rule); max-width: var(--measure); }
.cv-about .tech .cap { font-family: var(--mono); font-size: 0.66rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--faint); margin: 0 0 0.5rem; }
.cv-about .tech .tech-note { font-size: 0.86rem; color: var(--muted); margin: 0 0 1.3rem; max-width: 34rem; }
.cv-about .tech .tech-note b { color: var(--ink); font-weight: 600; }
.cv-about .tech .stack { display: grid; grid-template-columns: 7.5rem 1fr; gap: 0.55rem 1rem; font-family: var(--mono); font-size: 0.74rem; color: var(--faint); letter-spacing: 0.01em; line-height: 1.5; }
.cv-about .tech .stack dt { color: var(--muted); font-weight: 600; }
.cv-about .tech .stack dd { margin: 0; }

.cv-about footer { margin-top: clamp(3.5rem, 7vw, 5rem); padding-top: 2rem; border-top: 1px solid var(--rule-strong); }
.cv-about .sign { font-family: var(--serif); font-style: italic; font-size: var(--step-2); line-height: 1.4; color: var(--ink); max-width: 32rem; text-wrap: pretty; margin: 0; }
.cv-about .backhome { display: inline-block; margin-top: 2rem; font-family: var(--mono); font-size: 0.75rem; color: var(--muted); border: none; letter-spacing: 0.02em; }
.cv-about .backhome:hover { color: var(--accent); }

.cv-about .rise { opacity: 0; transform: translateY(14px); animation: cvRise .7s cubic-bezier(.2,.7,.2,1) forwards; }
.cv-about .d1 { animation-delay: .05s; }
.cv-about .d2 { animation-delay: .15s; }
@keyframes cvRise { to { opacity: 1; transform: none; } }

@media (max-width: 620px) {
  .cv-about .systems { grid-template-columns: 1fr; }
  .cv-about .ledger { grid-template-columns: 1fr; }
  .cv-about .ledger .cell { padding: 1.2rem 0; }
  .cv-about .ledger .cell + .cell { padding-left: 0; border-left: none; }
}
@media (max-width: 480px) {
  .cv-about .tech .stack { grid-template-columns: 1fr; gap: 0.15rem 0; }
  .cv-about .tech .stack dd { margin: 0 0 0.7rem; }
}
@media (prefers-reduced-motion: reduce) {
  .cv-about .rise { animation: none; opacity: 1; transform: none; }
}
`;

const About = () => {
  return (
    <div className="cv-about">
      <title>About · Vincent Tran</title>
      <meta
        name="description"
        content="Vincent Tran — engineer. Judgment over code volume: product, strategy, architecture, planning, review, problem-solving."
      />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, self-authored scoped stylesheet — no user input */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="wrap">
        <header className="hero">
          <p className="eyebrow rise d1">
            Software engineer · systems &amp; product judgment
          </p>
          <h1 className="name rise d1">Vincent Tran</h1>
          <p className="handle rise d1">
            <a href="https://github.com/shinaBR2">github.com/shinaBR2</a>
            {' · '}shinaBR2
          </p>
          <p className="thesis rise d2">
            Writing code is the cheap part now. The value is the judgment around
            it — deciding <b>what to build</b>,{' '}
            <span className="del">what to delete</span>, and how to make a team
            genuinely <b>confident</b> in everything that ships.
          </p>
        </header>

        <section>
          <div className="sec-head">
            <span className="num">01</span>
            <h2>The bet I make on myself</h2>
          </div>
          <p className="lead">
            The market is flooded with people who can produce code — models now
            do it faster than any of us. The scarce thing is knowing which code
            should exist at all, and having the taste and the system to keep a
            product simple as it grows.
          </p>
          <p className="muted">
            That's the work. Every change has to answer four questions before a
            line gets written:
          </p>
          <ol className="questions">
            <li>
              <span>
                Does it make the <b>architecture simpler</b>?
              </span>
            </li>
            <li>
              <span>
                Does it help us <b>ship faster</b>?
              </span>
            </li>
            <li>
              <span>
                Does it <b>improve the experience</b>?
              </span>
            </li>
            <li>
              <span>
                Can we <b>delete</b> code instead of adding it?
              </span>
            </li>
          </ol>
        </section>

        <section>
          <div className="sec-head">
            <span className="num">02</span>
            <h2>What I bring</h2>
            <span className="aside">the constants</span>
          </div>
          <div className="strengths">
            <div className="strength">
              <span className="tag">Product judgment</span>
              <h3>Knowing what deserves to exist</h3>
              <p>
                Every effort starts from the concept, not the code — motivation,
                edge cases, and downstream impact interrogated until the idea is
                genuinely clear, with a hard rule that nothing gets built until
                that understanding is shared. And product taste held as{' '}
                <b>principles, not vibes</b> — every design decision traces back
                to a reason, never a whim.
              </p>
            </div>

            <div className="strength">
              <span className="tag">Strategy · the discipline of less</span>
              <h3>Subtraction as the default move</h3>
              <p>
                Boring and proven beats clever. Before adding anything: can it
                be deleted or extended instead — and does the platform already
                solve it? Dead weight gets retired rather than carried "just in
                case." The <b>most maintainable solution wins</b>, every time.
              </p>
            </div>

            <div className="strength">
              <span className="tag">Architecture · systems design</span>
              <h3>Load-bearing decisions that hold</h3>
              <p>
                Architectural calls made to survive growth, not just today's
                feature — clear boundaries, a single source of truth,
                conventions that make the right thing the easy thing. And the
                traps get <b>written down</b>, so knowledge compounds instead of
                living in one head.
              </p>
            </div>

            <div className="strength">
              <span className="tag">Planning · decomposition</span>
              <h3>Turning big work into safe, fast waves</h3>
              <p>
                Breaking a large effort into a real dependency graph — what's
                isolated, what's genuinely blocked, what blocks others — then
                into the smallest shippable pieces.{' '}
                <b>
                  Deep planning is exactly what makes fast, direct-to-main work
                  safe.
                </b>
              </p>
            </div>

            <div className="strength">
              <span className="tag">Review · quality systems</span>
              <h3>Confidence built as infrastructure</h3>
              <p>
                Care doesn't scale; gates do. Review runs as a system with
                escalating depth — self-review, an automated CI gate, and a deep
                maintainability pass for high-risk change — tuned for
                abstraction quality and complexity creep, not just bugs.{' '}
                <b>Nothing merges on autopilot.</b>
              </p>
            </div>

            <div className="strength">
              <span className="tag">Problem solving</span>
              <h3>Reasoning from evidence, verified for real</h3>
              <p>
                Plausible-but-unverified conclusions don't survive. Problems get
                traced to an <b>actual root cause</b>, and the fix gets
                confirmed where it matters — in production, not on paper.
              </p>
            </div>
          </div>

          <p className="subhead">How it becomes repeatable</p>
          <div className="systems">
            <div className="system">
              <h4>Micro-PR delivery</h4>
              <p>
                Small, reversible, independently reviewable changes straight to
                main — high throughput that stays safe.
              </p>
            </div>
            <div className="system">
              <h4>Tests as a pyramid</h4>
              <p>
                Storybook, unit, and end-to-end — so confidence is checked,
                never assumed.
              </p>
            </div>
            <div className="system">
              <h4>Layered review gates</h4>
              <p>
                Self-review, a CI state machine, and a deep maintainability
                pass, scaled to the risk of the change.
              </p>
            </div>
            <div className="system">
              <h4>Externalized knowledge</h4>
              <p>
                Conventions and hard-won lessons written as reusable rules — so
                the team, and the tooling, get sharper over time.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="sec-head">
            <span className="num">03</span>
            <h2>Principles I don't trade away</h2>
          </div>
          <p className="muted">
            My philosophy is my most valuable asset — even when it isn't the
            fashionable thing to respect. These are the ideas everything here is
            built on.
          </p>
          <div className="quotes">
            <blockquote>
              <p>“Simplicity is the ultimate sophistication.”</p>
              <cite>Leonardo da Vinci — simple is the hard part</cite>
            </blockquote>
            <blockquote>
              <p>
                “Bad programmers worry about the code. Good programmers worry
                about data structures and their relationships.”
              </p>
              <cite>Linus Torvalds — fundamentals over syntax</cite>
            </blockquote>
            <blockquote>
              <p>“Imagination is more important than knowledge.”</p>
              <cite>Albert Einstein — possibility over recall</cite>
            </blockquote>
          </div>
        </section>

        <section>
          <div className="sec-head">
            <span className="num">04</span>
            <h2>Selected work</h2>
            <span className="aside">the proof, by project</span>
          </div>

          <article className="project">
            <p className="project-kind">Current role</p>
            <div className="project-head">
              <h3 className="project-name">Product engineering, small team</h3>
              <span className="project-meta">
                with the CTO + one junior · 2026
              </span>
            </div>
            <p className="project-desc">
              Core engineer owning delivery end-to-end. What the way of working
              above produced in six months:
            </p>

            <div className="ledger">
              <div className="cell">
                <span className="fig">
                  92<span className="u">%</span>
                </span>
                <span className="fig-label">Backend cut down</span>
                <span className="fig-sub">91k → 7k lines</span>
              </div>
              <div className="cell">
                <span className="fig">118k</span>
                <span className="fig-label">Test coverage, from zero</span>
                <span className="fig-sub">Storybook · unit · E2E</span>
              </div>
              <div className="cell">
                <span className="fig">1,984</span>
                <span className="fig-label">PRs shipped</span>
                <span className="fig-sub">of 3,225 team-wide</span>
              </div>
            </div>
            <p className="ledger-note">
              The high PR count is a deliberate micro-PR method — small,
              reversible, independently reviewable changes, not padding.
            </p>
            <p className="demonstrates">
              <b>Demonstrates</b> — the discipline of less · quality systems ·
              planning
            </p>
          </article>

          <article className="project">
            <p className="project-kind">Personal project · self-directed</p>
            <div className="project-head">
              <h3 className="project-name">
                sworld — a full-stack product monorepo
              </h3>
              <span className="project-meta">
                github.com/shinaBR2 · ongoing
              </span>
            </div>
            <p className="project-desc">
              A complete product built and run solo — several web apps, backend
              services, and the data layer — as one coherent system. Where the
              philosophy above gets practiced with nobody asking.
            </p>
            <ul className="evidence">
              <li>
                Consolidated{' '}
                <b>three separate repositories into one clean monorepo</b> — a
                large, risky migration executed without disruption.
              </li>
              <li>
                One source of truth for all UI, strict data-layer boundaries,
                and conventions captured as{' '}
                <b>reusable rules the tooling enforces</b>.
              </li>
              <li>
                Shipped features end-to-end — including a media viewer handling
                both <b>photos and streaming video</b> — from concept through
                production.
              </li>
              <li>
                Traced a subtle media-pipeline failure to a specific tool
                version emitting a malformed segment; verified the real fix and{' '}
                <b>confirmed it in production</b> rather than reverting blindly.
              </li>
              <li>
                That taste made concrete: <b>generous space</b>, the right
                affordance for each job (create vs. manage), and a clear design
                north star per surface.
              </li>
            </ul>
            <p className="demonstrates">
              <b>Demonstrates</b> — architecture · product judgment · problem
              solving
            </p>
          </article>
        </section>

        <div className="tech">
          <p className="cap">The stack I choose</p>
          <p className="tech-note">
            Tools matter least of all — <b>I can work across the whole stack</b>
            , and anything here is learnable in a week. So this isn't a list of
            what I'm able to do. It's simply what I want to build with.
          </p>
          <dl className="stack">
            <dt>Frontend</dt>
            <dd>React · Next.js · TypeScript</dd>
            <dt>State / Data</dt>
            <dd>GraphQL · React Query</dd>
            <dt>Backend</dt>
            <dd>Node · Hono · PostgreSQL · Hasura</dd>
            <dt>Ops</dt>
            <dd>GCP · GitHub Actions · Turborepo · pnpm</dd>
          </dl>
        </div>

        <footer>
          <p className="sign">
            “Don't run behind success. Follow behind excellence — success will
            come all the way behind you.”
          </p>
          <Link to="/" className="backhome">
            ← back home
          </Link>
        </footer>
      </div>
    </div>
  );
};

export const Route = createLazyFileRoute('/about')({
  component: About,
});
