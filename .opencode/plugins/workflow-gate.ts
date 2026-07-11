const isGatedTool = (tool: string) => tool === 'edit' || tool === 'write';

const isInWorktree = (cwd: string) => cwd.includes('/.claude/worktrees/');

const getBranch = async ($: any, cwd: string) => {
  const result = await $`git branch --show-current`.cwd(cwd).text();
  return result.trim();
};

const getMergeBase = async ($: any, cwd: string) => {
  const result =
    await $`git merge-base --is-ancestor origin/main HEAD && echo "ancestor" || echo "not-ancestor"`
      .cwd(cwd)
      .text();
  return result.trim() === 'ancestor';
};

const getTicketFromBranch = (branch: string) => {
  const match = branch.match(/^(swo-\d+)/i);
  return match ? match[1].toUpperCase() : null;
};

const isTicketInProgress = async ($: any, ticket: string) => {
  try {
    const result = await $`linear issue view ${ticket} --json state`.text();
    const json = JSON.parse(result.trim());
    return json?.state?.type === 'started';
  } catch {
    return false;
  }
};

// biome-ignore lint/suspicious/noExplicitAny: BunShell type from opencode runtime
export default async ({ $, directory }: any) => {
  return {
    'permission.ask': async (_input: any, output: any) => {
      if (!isGatedTool(_input.tool)) return;

      if (!isInWorktree(directory)) return;

      let branch: string;
      try {
        branch = await getBranch($, directory);
      } catch {
        output.status = 'deny';
        return;
      }
      if (!branch) {
        output.status = 'deny';
        return;
      }

      const ticket = getTicketFromBranch(branch);
      if (!ticket) {
        output.status = 'deny';
        return;
      }

      if (!(await isTicketInProgress($, ticket))) {
        output.status = 'deny';
        return;
      }

      if (!(await getMergeBase($, directory))) {
        output.status = 'deny';
      }
    },
  };
};
