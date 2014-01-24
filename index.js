var through = require('through2')

module.exports = WriteStream

function WriteStream(opts) {
  if (!(this instanceof WriteStream)) return new WriteStream(opts)
  if (!opts) opts = {}
  this.opts = opts
  this.headers = this.opts.headers
  this.separator = this.opts.separator || ','
  this.newline = this.opts.newline || '\n'
  this.stream = through({objectMode: true}, this.write.bind(this))
  return this.stream
}

WriteStream.prototype.write = function(row, enc, next) {
  if (!this.headers) {
    if (Array.isArray(row)) {
      this.stream.emit('error', new Error('no headers specified'))
      next()
      return false
    }
    this.headers = Object.keys(row)
  }
  if (!this.sentHeaders) {
    this.stream.push(this.serialize(this.headers))
    this.sentHeaders = true
  }
  if (!Array.isArray(row)) row = this.headers.map(function(key) { return row[key] })
  this.stream.push(this.serialize(row))
  next()
}

WriteStream.prototype.serialize = function(row) {
  var str = false
  for (var i = 0; i < row.length; i++) {
    var cell = row[i]
    if (typeof cell !== 'string') cell = cell.toString()
    var needsEscape = false
    if (cell.indexOf('"') > -1) {
      needsEscape = true
      cell = cell.replace(/"/g, '""')
    }
    if (cell.indexOf(this.separator) > -1 || cell.match(/\r?\n/)) {
      needsEscape = true
    }
    if (needsEscape) cell = '"' + cell + '"'
    if (!str) str = cell
    else str += this.separator + cell
  }
  return str + this.newline
}
