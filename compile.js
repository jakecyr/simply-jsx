// @ts-check
const { default: watch } = require('node-watch');
const path = require('path');
const fs = require('fs-extra');
const cheerio = require('cheerio');
const express = require('express');
const { execSync } = require('child_process');
const { existsSync } = require('fs-extra');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '/dist'))).listen(port);

const compileIndexHTML = async () => {
  const html = await fs.readFile('public/index.html');
  const $ = cheerio.load(html);
  $('body').append(`<script src="base.js"></script>`);
  $('body').append(`<script src="bundle.js" defer async></script>`);
  await fs.writeFile('dist/index.html', $.root().html());
};

const compileBaseJS = async () => {
  execSync(`./node_modules/.bin/babel -d dist src/base.jsx`);
};

const bundleJSX = async () => {
  execSync(`./node_modules/.bin/babel -d jsxTemp src/**/*.jsx`);
  execSync(`./node_modules/.bin/browserify jsxTemp/index.js -o dist/bundle.js`);
  await fs.rm('jsxTemp', { recursive: true, force: true });
};

watch('public', { recursive: true }, async (event, name) => {
  if (!existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  const resolvedFilePath = path.resolve(name);
  const resolvedDistPath = path.resolve(name.replace('public/', 'dist/'));

  if (name === 'public/index.html') {
    await compileIndexHTML();
  } else {
    await fs.copyFile(resolvedFilePath, resolvedDistPath);
  }

  if (name !== 'public/index.html' && !existsSync('dist/index.html')) {
    await compileIndexHTML();
  }
});

watch('src', { recursive: true }, async (event, name) => {
  if (!existsSync('dist/base.js')) {
    await compileBaseJS();
  }

  if (!existsSync('dist/bundle.js')) {
    await bundleJSX();
  }

  if (!existsSync('dist/index.html')) {
    await compileIndexHTML();
  }

  if (name === 'src/index.jsx') {
    await bundleJSX();
  } else if (name === 'src/base.jsx') {
    await compileBaseJS();
  }
});
