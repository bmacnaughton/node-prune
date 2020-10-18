// default files pruned.
//
// Copied from yarn (mostly).
const files = [
  'Jenkinsfile',
  'Makefile',
  'Gulpfile.js',
  'Gruntfile.js',
  'gulpfile.js',
  '.DS_Store',
  '.tern-project',
  '.gitattributes',
  '.editorconfig',
  '.eslintrc',
  'eslint',
  '.eslintrc.js',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintignore',
  '.stylelintrc',
  'stylelint.config.js',
  '.stylelintrc.json',
  '.stylelintrc.yaml',
  '.stylelintrc.yml',
  '.stylelintrc.js',
  '.htmllintrc',
  'htmllint.js',
  '.lint',
  '.npmrc',
  '.npmignore',
  '.jshintrc',
  '.flowconfig',
  '.documentup.json',
  '.yarn-metadata.json',
  '.travis.yml',
  'appveyor.yml',
  '.gitlab-ci.yml',
  'circle.yml',
  '.coveralls.yml',
  'CHANGES',
  'changelog',
  'LICENSE.txt',
  'LICENSE',
  'LICENSE-MIT',
  'LICENSE.BSD',
  'license',
  'LICENCE.txt',
  'LICENCE',
  'LICENCE-MIT',
  'LICENCE.BSD',
  'licence',
  'AUTHORS',
  'CONTRIBUTORS',
  '.yarn-integrity',
  '.yarnclean',
  '_config.yml',
  '.babelrc',
  '.yo-rc.json',
  'jest.config.js',
  'karma.conf.js',
  'wallaby.js',
  'wallaby.conf.js',
  '.prettierrc',
  '.prettierrc.yml',
  '.prettierrc.toml',
  '.prettierrc.js',
  '.prettierrc.json',
  'prettier.config.js',
  '.appveyor.yml',
  'tsconfig.json',
  'tslint.json',
];

//
// default directories pruned regardless of their location.
//
// Copied from yarn (mostly).
const directories = [
  '__tests__',
  //'test',
  //'tests',
  'powered-test',
  //'docs',
  //'doc',
  '.idea',
  '.vscode',
  'website',
  'images',
  'assets',
  //'example',
  //'examples',
  'coverage',
  '.nyc_output',
  '.circleci',
  '.github',
];

// package directories pruned only if there is 1 directory between them
// and a node_modules directory, e.g., node_modules/node-prune/test will
// be pruned but node_modules/test and node_modules/node-prune/lib/test
// will not be pruned. there is a node module named 'test' it turns out.
const packageDirectories = [
  'test',
  'tests',
  'docs',
  'doc',
  'guides',
  'example',
  'examples'
];

// default extensions pruned.
const extensions = [
  '.markdown',
  '.md',
  '.mkd',
  '.ts',
  '.jst',
  '.coffee',
  '.tgz',
  '.swp',
];

module.exports = {
  files,
  directories,
  packageDirectories,
  extensions,
};


//
// this is from yarn's autoclean cli command
//
// eslint-disable-next-line no-unused-vars
const DEFAULT_FILTER = `
# test directories
__tests__
test
tests
powered-test

# asset directories
docs
doc
website
images
assets

# examples
example
examples

# code coverage directories
coverage
.nyc_output

# build scripts
Makefile
Gulpfile.js
Gruntfile.js

# configs
appveyor.yml
circle.yml
codeship-services.yml
codeship-steps.yml
wercker.yml
.tern-project
.gitattributes
.editorconfig
.*ignore
.eslintrc
.jshintrc
.flowconfig
.documentup.json
.yarn-metadata.json
.travis.yml

# misc
*.md
`;
