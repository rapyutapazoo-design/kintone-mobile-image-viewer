// ビルドスクリプト: src/index.js と PhotoSwipe を 1 ファイルにバンドルする。
// 出力: dist/kintone-image-viewer.bundle.js（Kintoneに「JavaScript」として登録）
//       dist/photoswipe.css         （Kintoneに「CSS」として登録）
import * as esbuild from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, 'dist');
const watch = process.argv.includes('--watch');

await mkdir(dist, { recursive: true });

const options = {
  entryPoints: [resolve(__dirname, 'src/index.js')],
  bundle: true,
  format: 'iife',          // Kintoneは通常スクリプトとして読み込むためIIFEで自己完結させる
  target: ['es2019'],      // モバイルブラウザ互換性のため控えめに
  minify: true,
  legalComments: 'none',
  outfile: resolve(dist, 'kintone-image-viewer.bundle.js'),
  logLevel: 'info',
};

// PhotoSwipe本体のCSSをdistへコピー（Kintoneに別途CSSとして登録する）
const copyCss = async () => {
  await copyFile(
    resolve(__dirname, 'node_modules/photoswipe/dist/photoswipe.css'),
    resolve(dist, 'photoswipe.css'),
  );
  console.log('copied photoswipe.css -> dist/');
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  await copyCss();
  console.log('watching...');
} else {
  await esbuild.build(options);
  await copyCss();
  console.log('build done -> dist/');
}
