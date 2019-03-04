#!/usr/bin/env bash
rm -rf dist
rm -rf build

mkdir dist

cp src/html/*.html dist
npx postcss --use autoprefixer --base src/css --dir dist src/css/**/*.css

mkdir build
npx browserify src/js/main.js --outfile dist/main.js
rm -rf build
