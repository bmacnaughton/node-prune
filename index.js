#!/usr/bin/env node
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const walk = require('action-walk');
const defaults = require('./defaults');

const dirs = new Set();
defaults.directories.forEach(d => dirs.add(d));
const pkgDirs = new Set();
defaults.packageDirectories.forEach(p => pkgDirs.add(p));
const files = new Set();
defaults.files.forEach(f => files.add(f));
const extensions = new Set();
defaults.extensions.forEach(e => extensions.add(e));

/* eslint-disable no-console */


const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('usage: action-walk directory');
  process.exit(1);
}
const dir = args[0];

const own = makeOwn();
const options = {dirAction, fileAction, own, stat: 'lstat', dryRun: true};

async function main () {
  console.log('deleting:');
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
      //console.log(`percent bytes deleted ${(own.bytesDeleted / own.bytes * 100).toFixed(1)}`);
    });

}

main().catch(e => console.log(`error: ${e.code} ${e.message}`));

async function dirAction (filepath, ctx) {
  const {dirent, stat, own, stack} = ctx;
  own.dirs += 1;

  if (dirs.has(dirent.name) || (pkgDirs.has(dirent.name) && stack[stack.length - 2] === 'node_modules')) {
    // delete this directory after walking it to get the total size
    // that was removed. start with the size of this directory.
    const subOwn = makeOwn({
      bytes: ctx.stat.size,
      dirs: 1,
    });
    subOwn.show = false;
    const subOptions = {
      dirAction,
      fileAction,
      own: subOwn,
      stat: 'lstat',
    };
    await walk(filepath, subOptions);
    own.bytes += subOwn.bytes;
    own.bytesDeleted += subOwn.bytes;
    own.dirs += subOwn.dirs;
    own.dirsDeleted += subOwn.dirs;
    own.filesDeleted += subOwn.files;


    if (!options.dryRun) {
      await fsp.rmdir(filepath, {recursive: true});
    } else {
      console.log(`subtree: ${filepath}`, subOwn.bytes);
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

  if (files.has(dirent.name)) {
    own.filesDeleted += 1;
    own.bytesDeleted += stat.size;
    if (!options.dryRun) {
      return fsp.unlink(filepath);
    } else {
      console.log(`file: ${dirent.name}:`, stat.size);
    }
  } else if (extensions.has(path.extname(dirent.name))) {
    own.filesDeleted += 1;
    own.bytesDeleted += stat.size;
    if (!options.dryRun) {
      return fsp.unlink(filepath);
    } else {
      console.log(`ext: ${filepath}:`, stat.size);
    }
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
