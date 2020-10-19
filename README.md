# node-scrub

Walk a directory tree and remove files not necessary in a production node environment.

WARNING: this program walks a directory tree and deletes files. Double check what
you are doing before executing. The program's `--dry-run` option is `true` by default.
It is highly advisable to use it in dry-run mode first.


## Installation

`npm install -g node-scrub`

## Usage

Typical usage is to run it with the target node_modules directory as the argument.

Executing in the node-scrub project root, will be something
like:

```bash
$ node-scrub node_modules
------summary------
 (dry-run results)
total bytes: 65818 directories: 6 files: 26
deleted bytes: 35412 directories: 0 files: 20
percents: bytes 53.8 directories 0.0 files 76.9
elapsed time 11ms
```

Note that the option `--dry-run` is by default true and that's a good thing because
if I accidentally executed it as follows it would delete files that I probably didn't
want to delete.

```
$ node-scrub .
------summary------
 (dry-run results)
total bytes: 329447 directories: 54 files: 89
deleted bytes: 37157 directories: 0 files: 22
percents: bytes 11.3 directories 0.0 files 24.7
elapsed time 22ms
```

## Command-line options

The first argument is the root of the directory tree to walk, looking for
files and directories to delete.

`--dry-run` - [true], use `--dry-run false` to delete files and directories.
`--details, -d` - [false], show count and size for each match deleted.
`--verbose` - [false], print every directory and file deleted.
`--veryVerbose` - [false], print every directory, file, and link traversed + verbose.

### todos

- add command-line exclusions, for now you have to fiddle with defaults.js
- allow detailed listing of deletion filepaths by pattern-matched
- write tests (only manual tested at this point)
