const { PDFParse } = require('pdf-parse');

const chunks = [];
process.stdin.on('data', (chunk) => chunks.push(chunk));
process.stdin.on('end', async () => {
  try {
    const inputBuf = Buffer.concat(chunks);
    if (!inputBuf || inputBuf.length === 0) {
      process.stdout.write(JSON.stringify({ text: '', pages: 1, wordCount: 0 }));
      return;
    }
    const parser = new PDFParse({ data: inputBuf });
    const res = await parser.getText();
    const text = (res.text || '').trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const pages = res.pages?.length || res.total || 1;

    process.stdout.write(
      JSON.stringify({
        text,
        pages: Math.max(1, pages),
        wordCount,
      })
    );
  } catch (err) {
    process.stderr.write(err && err.message ? err.message : String(err));
    process.exit(1);
  }
});
