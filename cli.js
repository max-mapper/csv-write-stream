#!/usr/bin/env node
var csv = require('./')
var minimist = require('minimist')
var ndj = require('ndjson')

var args = minimist(process.argv.slice(2))


process.stdin
  .pipe(ndj.parse())
  .pipe(csv(args))
  .pipe(process.stdout)
