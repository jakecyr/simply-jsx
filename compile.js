#!/usr/bin/env node

const { default: watch } = require('node-watch');
const path = require('path');
const fs = require('fs-extra');
const cheerio = require('cheerio');
const express = require('express');
const { execSync } = require('child_process');
const { existsSync } = require('fs-extra');
const { Server } = require('socket.io');

/** @type {Server} */
let io = null;

const CORE_JS_FILENAME = 'core.js';
const CORE_JS_FILE = path.join(__dirname, CORE_JS_FILENAME);
const BUNDLE_FILENAME = 'bundle.js';

const CONFIG_FILE = path.resolve('simply.json');
const BABEL_EXEC_PATH = path.join(__dirname, './node_modules/.bin/babel');
const BABEL_CONFIG_FILE_PATH = path.join(__dirname, '.babelrc');
const BROWSERIFY_EXEC_PATH = path.join(__dirname, './node_modules/.bin/browserify');

if (!existsSync(CONFIG_FILE)) {
  throw new Error('simply.json config file missing');
}

const CONFIG_SETTINGS = require(CONFIG_FILE);

if (!CONFIG_SETTINGS.build) {
  throw new Error(`Missing 'build' option in config file`);
}

if (!CONFIG_SETTINGS.build) {
  throw new Error(`Missing 'build' option in config file`);
}

if (!CONFIG_SETTINGS.staticFiles) {
  throw new Error(`Missing 'staticFiles' option in config file`);
}

const DIST_DIR = path.resolve(CONFIG_SETTINGS.build);
const SRC_DIR = path.resolve(CONFIG_SETTINGS.source);
const PUBLIC_DIR = path.resolve(CONFIG_SETTINGS.staticFiles);
const INDEX_HTML_FILE = path.join(PUBLIC_DIR, 'index.html');

if (!existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR);
}

const notifyOfChange = () => {
  if (io) {
    io.emit('change');
  }
};

const reload = () => {
  if (io) {
    console.log('Reloading client...');
    io.emit('reload');
  }
};

const getDistFilePath = (srcFileName) => path.join(DIST_DIR, srcFileName);

const startLocalServer = () => {
  const app = express();
  const port = process.env.PORT || 3000;
  const server = app.use(express.static(DIST_DIR)).listen(port);
  io = new Server();
  io.listen(server);
  return app;
};

const compileIndexHTML = async () => {
  const html = await fs.readFile(INDEX_HTML_FILE);
  const $ = cheerio.load(html);
  $('body').append(`<script src="${CORE_JS_FILENAME}"></script>`);
  $('body').append(`<script src="${BUNDLE_FILENAME}" defer async></script>`);
  await fs.writeFile(getDistFilePath('index.html'), $.root().html());
};

const compileCore = async () => {
  execSync(`${BROWSERIFY_EXEC_PATH} -o ${getDistFilePath(CORE_JS_FILENAME)} ${CORE_JS_FILE}`);
};

const bundleJSX = async () => {
  execSync(`${BABEL_EXEC_PATH} --config-file ${BABEL_CONFIG_FILE_PATH} -d jsxTemp src/**/*.jsx`);
  execSync(`${BROWSERIFY_EXEC_PATH} -o ${getDistFilePath(BUNDLE_FILENAME)} jsxTemp/index.js`);
  await fs.rm('jsxTemp', { recursive: true, force: true });
};

watch(PUBLIC_DIR, { recursive: true }, async (event, name) => {
  console.log('Change detected');
  notifyOfChange();

  if (!existsSync(DIST_DIR)) {
    await fs.mkdir(DIST_DIR);
  }

  const resolvedSrcFilePath = path.resolve(name);
  const resolvedDistFilePath = path.resolve(name.replace(PUBLIC_DIR + '/', DIST_DIR + '/'));

  if (name === INDEX_HTML_FILE) {
    await compileIndexHTML();
  } else {
    await fs.copyFile(resolvedSrcFilePath, resolvedDistFilePath);
  }

  if (name !== INDEX_HTML_FILE && !existsSync(getDistFilePath('index.html'))) {
    await compileIndexHTML();
  }

  reload();
});

watch(SRC_DIR, { recursive: true }, async (event, name) => {
  console.log('Change detected');
  notifyOfChange();

  if (!existsSync(getDistFilePath(CORE_JS_FILENAME))) {
    await compileCore();
  }

  if (!existsSync(getDistFilePath('index.html'))) {
    await compileIndexHTML();
  }

  await bundleJSX();

  reload();
});

(async () => {
  try {
    await compileCore();
    await compileIndexHTML();
    startLocalServer();
  } catch (error) {
    console.error(error);
  }
})();
