import { stdout } from 'node:process';
import process from 'node:process';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const [{ LEVEL_CATALOG }, { calculateStarRating }, { runLevelReference }] = await Promise.all([
    server.ssrLoadModule('/src/game/domain/level-catalog.model.ts'),
    server.ssrLoadModule('/src/game/domain/level-scoring.model.ts'),
    server.ssrLoadModule('/src/game/simulation/reference-runner.ts'),
  ]);
  const summary = LEVEL_CATALOG.map((level) => {
    const state = runLevelReference(level);
    return {
      level: level.id,
      result: state.mode,
      ticks: state.tick,
      pieces: state.metrics.piecesUsed,
      emitted: state.metrics.itemsEmitted,
      rejected: state.metrics.rejectedCount,
      stars: calculateStarRating(level, state),
    };
  });
  stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (summary.some((result) => result.result !== 'RESULT' || result.rejected !== 0 || result.stars !== 3)) process.exitCode = 1;
} finally {
  await server.close();
}
