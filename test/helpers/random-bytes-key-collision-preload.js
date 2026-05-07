const crypto = require('node:crypto');

const originalRandomBytes = crypto.randomBytes;
const firstKeyBytes = Buffer.from('0001020304050607', 'hex');
const retryKeyBytes = Buffer.from('1011121314151617', 'hex');
let keyGenerationCalls = 0;

crypto.randomBytes = function randomBytesWithForcedKeyCollision(size, ...rest) {
  // Keep async random byte calls untouched.
  if (typeof rest[0] === 'function') {
    return originalRandomBytes.call(this, size, ...rest);
  }

  const stack = new Error().stack || '';
  if (size === 8 && stack.includes('/routes/index.js')) {
    keyGenerationCalls += 1;
    if (keyGenerationCalls <= 2) return Buffer.from(firstKeyBytes);
    if (keyGenerationCalls === 3) return Buffer.from(retryKeyBytes);
  }

  return originalRandomBytes.call(this, size, ...rest);
};
