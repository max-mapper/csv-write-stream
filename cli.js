#!/usr/bin/env node
var csv = require('./')
var fs = require('fs')
var minimist = require('minimist')
var ldj = require('ldjson-stream')

var args = minimist(process.argv.slice(2))


process.stdin
  .pipe(ldj.parse())
  .pipe(csv(args))
  .pipe(process.stdout)