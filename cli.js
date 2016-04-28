#!/usr/bin/env node
var ArgumentParser = require('argparse').ArgumentParser
var csv = require('./')
var ndj = require('ndjson')
var packageInfo = require('./package')

argparser = new ArgumentParser({
  addHelp: true,
  description: packageInfo.description + ' JSON is read from STDIN, formatted' +
  ' to CSV, and written to STDOUT.',
  version: packageInfo.version
})

argparser.addArgument(['--separator'], {
  help: "The separator character to use. Defaults to ','.",
  defaultValue: ','
})
argparser.addArgument(['--newline'], {
  help: "The newline character to use. Defaults to $'\\n'.",
  defaultValue: '\n'
})
argparser.addArgument(['--headers'], {
  nargs: '+',
  help: 'The list of headers to use. If omitted, the keys of the first row ' +
  'written to STDIN will be used',
})
argparser.addArgument(['--no-send-headers'], {
  action: 'storeFalse',
  help: "Don't print the header row.",
  defaultValue: true,
  dest: 'sendHeaders'
})

args = argparser.parseArgs()

process.stdin
  .pipe(ndj.parse())
  .pipe(csv(args))
  .pipe(process.stdout)
