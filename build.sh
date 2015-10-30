#!/bin/sh
set -e
echo PEG.js
node ./node_modules/pegjs/bin/pegjs parser/delphi.pegjs
echo TypeScript...
./node_modules/typescript/bin/tsc -p src
echo Babel...
node ./node_modules/babel-cli/bin/babel.js --presets es2015 --plugins transform-es2015-modules-commonjs --out-dir bin es6