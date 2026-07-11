const isGatedTool = (tool: string) => tool === 'edit' || tool === 'write';

const isInWorktree = (cwd: string) => cwd.includes('/.claude/worktrees/');

const getBranch = async ($: any) => {
  const result = await $`git branch --show-current`.text();
  return result.trim();
};

const getMergeBase = async ($: any) => {
  const result =
    await $`git merge-base --is-ancestor origin/main HEAD && echo "ancestor" || echo "not-ancestor"`.text();
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

      const branch = await getBranch($);
      if (!branch) return;

      const ticket = getTicketFromBranch(branch);
      if (!ticket) {
        output.status = 'deny';
        return;
      }

      if (!(await isTicketInProgress($, ticket))) {
        output.status = 'deny';
        return;
      }

      if (!(await getMergeBase($))) {
        output.status = 'deny';
      }
    },
  };
};
