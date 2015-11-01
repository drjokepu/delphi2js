#!/bin/sh
set -e
node ./node_modules/pegjs/bin/pegjs parser/delphi.pegjs
./node_modules/typescript/bin/tsc -p src
node ./node_modules/babel-cli/bin/babel.js -q --presets es2015 --plugins transform-es2015-modules-commonjs --out-dir bin es6