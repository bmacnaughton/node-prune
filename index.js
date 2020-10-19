#!/usr/bin/env node
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const walk = require('action-walk');
const configuration = require('./lib/configuration');
const defaults = require('./lib/defaults');

const start = Date.now();

const dirs = new Map();
defaults.directories.forEach(d => dirs.set(d, {n: 0, bytes: 0}));
const pkgDirs = new Map();
defaults.packageDirectories.forEach(p => pkgDirs.set(p, {n: 0, bytes: 0}));
const files = new Map();
defaults.files.forEach(f => files.set(f, {n: 0, bytes: 0}));
const xExtensions = new Set();
defaults.xExtensions.forEach(x => xExtensions.add(x))
const extensions = new Map();
defaults.extensions.forEach(e => extensions.set(e, {n: 0, bytes: 0}));

const details = [dirs, pkgDirs, files, extensions];

/* eslint-disable no-console */

const own = makeOwn();
const options = {dirAction, fileAction, linkAction, own, stat: 'lstat', dryRun: true};

async function main () {
  const {values: args, ...config} = await configuration.get();
  config.errors.forEach(e => console.error(e));
  config.warnings.forEach(w => console.log(w));
  config.unknowns.forEach(u => console.log(u));

  if (config.fatals.length) {
    throw new Error(config.fatals.join(';'));
  }

  const dir = args.directory;
  options.dryRun = args.dryRun;
  options.verbose = args.verbose || args.veryVerbose;
  options.veryVerbose = args.veryVerbose;
  options.details = args.details;

  if (options.verbose) {
    console.log('deleting: (subtree, file, and ext)');
  }
  return walk(dir, options)
    .then(() => {
      console.log('------summary------');
      if (options.dryRun) {
        console.log(' (dry-run results)');
      }
      console.log(`total bytes: ${own.bytes} directories: ${own.dirs} files: ${own.files}`);
      console.log(`deleted bytes: ${own.bytesDeleted} directories: ${own.dirsDeleted} files: ${own.filesDeleted}`);
      function pct (n, d) {return (n / d * 100).toFixed(1)}
      const pctBytes = pct(own.bytesDeleted, own.bytes);
      const pctDirs = pct(own.dirsDeleted, own.dirs);
      const pctFiles = pct(own.filesDeleted, own.files);
      console.log(`percents: bytes ${pctBytes} directories ${pctDirs} files ${pctFiles}`);
      console.log(`elapsed time ${(Date.now() - start)}ms`);

      if (options.details) {
        console.log('------details------');
        details.forEach(d => {
          for (const [pattern, stats] of d) {
            if (stats.n) {
              console.log(pattern, stats);
            }
          }
        })
      }
    });

}

main().catch(e => console.log(`error: ${e.code} ${e.message}`));

async function dirAction (filepath, ctx) {
  const {dirent, stat, own, stack} = ctx;
  own.dirs += 1;

  if (options.veryVerbose) {
    console.log(`d: ${stack.join('/')} ${dirent.name}`);
  }

  if (dirs.has(dirent.name) || (pkgDirs.has(dirent.name) && stack[stack.length - 2] === 'node_modules')) {
    // delete this directory after walking it to get the total size
    // that was removed. start with the size of this directory.
    const subOwn = makeOwn({
      bytes: ctx.stat.size,
    });
    subOwn.show = false;
    const subOptions = {
      dirAction,
      fileAction,
      linkAction,
      own: subOwn,
      stat: 'lstat',
    };
    await walk(filepath, subOptions);
    own.bytes += subOwn.bytes;
    own.bytesDeleted += subOwn.bytes;
    own.dirs += subOwn.dirs;
    own.dirsDeleted += subOwn.dirs;
    own.files += subOwn.files;
    own.filesDeleted += subOwn.files;

    let details;
    if (dirs.has(dirent.name)) {
      details = dirs.get(dirent.name);
    } else if (pkgDirs.has(dirent.name)) {
      details = pkgDirs.get(dirent.name);
    } else {
      throw new Error('pattern', dirent.name, 'not found in dirs or pkgDirs');
    }

    details.n += 1;
    details.bytes += subOwn.bytes;


    if (options.verbose) {
      console.log(`subtree: ${filepath}`, subOwn.bytes);
    }

    if (!options.dryRun) {
      await fsp.rmdir(filepath, {recursive: true});
    }

    // skip because we've already counted and deleted this
    // directory subtree.
    return 'skip';
  }

  own.bytes += stat.size;
}
async function fileAction (filepath, ctx) {
  const {dirent, stat, own} = ctx;
  own.bytes += stat.size;
  own.files += 1;

  if (options.veryVerbose) {
    console.log(`f: ${ctx.stack.join('/')} ${dirent.name}`);
  }

  if (files.has(dirent.name)) {
    own.filesDeleted += 1;
    own.bytesDeleted += stat.size;

    const details = files.get(dirent.name);
    details.n += 1;
    details.bytes += stat.size;

    if (options.verbose) {
      console.log(`file: ${dirent.name}:`, stat.size);
    }

    if (!options.dryRun) {
      return fsp.unlink(filepath);
    }
    return;
  }

  const ext = path.extname(dirent.name);

  if (!xExtensions.has(ext) && extensions.has(ext)) {
    own.filesDeleted += 1;
    own.bytesDeleted += stat.size;

    const details = extensions.get(ext);
    details.n += 1;
    details.bytes += stat.size;

    if (options.verbose) {
      console.log(`ext: ${filepath}:`, stat.size);
    }

    if (!options.dryRun) {
      return fsp.unlink(filepath);
    }
  }
}

async function linkAction (filepath, ctx) {
  const {stat, own} = ctx;
  own.bytes += stat.size;
  own.files += 1;

  if (options.veryVerbose) {
    console.log(`l: ${ctx.stack.join('/')} ${ctx.dirent.name}`);
  }
}

function makeOwn (proto) {
  const own = {
    bytes: 0,
    bytesDeleted: 0,
    dirs: 0,
    dirsDeleted: 0,
    files: 0,
    filesDeleted: 0,
  };
  return Object.assign(own, proto);
}
