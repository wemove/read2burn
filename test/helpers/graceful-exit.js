// Preloaded into the spawned server so SIGTERM exits normally and V8 flushes coverage data.
process.on('SIGTERM', () => process.exit(0));
