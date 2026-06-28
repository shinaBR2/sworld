/**
 * Exit the process after flushing stdout/stderr.
 *
 * `process.exit()` alone can truncate buffered writes when stdio is piped or
 * captured (the final `=== Done ===` block, etc.). This drains both streams via
 * their write callbacks first, then exits — with a short safety timeout so a
 * stuck stream can't hang us (the whole reason we force-exit is to NOT wait on
 * lingering keep-alive sockets).
 */
const flushThenExit = (code: number): void => {
  let pending = 2;
  const safety = setTimeout(() => process.exit(code), 1000);
  const done = (): void => {
    pending -= 1;
    if (pending === 0) {
      clearTimeout(safety);
      process.exit(code);
    }
  };
  // An empty write's callback fires once everything queued before it is flushed.
  process.stdout.write('', done);
  process.stderr.write('', done);
};

export { flushThenExit };
