const assert = require('node:assert/strict');

const options = {
  convertFullWidthToHalfWidth: true,
  convertHalfWidthToFullWidth: false,
  removePunctuationAfterQuotes: false,
  insertSpaceAfterExclamations: false,
  ensureEvenPunctuationCount: false,
  insertSpaceAtLineStart: false,
};

async function main() {
  const esm = await import('jp-novel-formatter');
  const cjs = require('jp-novel-formatter');

  assert.equal(esm.formatText('ＡＢＣ１２３', options), 'ABC123');
  assert.equal(cjs.formatText('ＡＢＣ１２３', options), 'ABC123');
  assert.equal(esm.formatText('ＡＢＣ１２３'), '　ABC123');
  assert.equal(cjs.formatText('ＡＢＣ１２３'), '　ABC123');
  assert.equal(esm.defaultFormatOptions.insertSpaceAtLineStart, true);
  assert.equal(cjs.defaultFormatOptions.insertSpaceAtLineStart, true);
  console.log('Node ESM import and CommonJS require passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
