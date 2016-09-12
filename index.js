var stream = require('stream');
var util = require('util');

var CsvWriteStream = function (opts) {
  if (!opts) opts = {};
  stream.Transform.call(this, {objectMode: true, highWaterMark: 16});

  this.sendHeaders = opts.sendHeaders !== false;
  this.headers = opts.headers || null;
  this.separator = opts.separator || opts.seperator || ',';
  this.newline = opts.newline || '\n';

  this._testReg = new RegExp('[' + regEsc(this.separator) + '\\r\\n"]', 'm');
  this._first = true;
  this._destroyed = false
};

util.inherits(CsvWriteStream, stream.Transform);

CsvWriteStream.prototype._rowFromArray = function (arr) {
  var testReg = this._testReg;
  var headers = this.headers;
  var builder = [];
  for (var i = 0; i < headers.length; i++) {
    var itm = arr[i];
    if (itm == null) {
      itm = "";
    }

    if (testReg.test(itm)) {
      itm = esc(itm);
    }
    builder.push(itm + '');
  }

  return builder.join(this.separator) + this.newline;
};

CsvWriteStream.prototype._rowFromObject = function (obj) {
  var testReg = this._testReg;
  var headers = this.headers;
  var builder = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var itm = obj[key];
    if (itm == null) {
      itm = '';
    }

    if (testReg.test(itm)) {
      itm = esc(itm + '');
    }

    builder.push(itm + '');
  }

  return builder.join(this.separator) + this.newline;
};

CsvWriteStream.prototype._transform = function (row, enc, cb) {
  var isArray = Array.isArray(row);

  if (!this.headers) {
    this.headers = Object.keys(row);
    if (isArray) {
      this.sendHeaders = false;
    }
  }

  if (this._first && this.headers) {
    this._first = false;

    if (this.sendHeaders) this.push(this._rowFromArray(this.headers))
  }

  if (isArray) {
    if (!this.headers) return cb(new Error('no headers specified'));
    this.push(this._rowFromArray(row))
  } else {
    this.push(this._rowFromObject(row))
  }

  cb()
};

CsvWriteStream.prototype.destroy = function (err) {
  if (this._destroyed) return;
  this._destroyed = true;

  var self = this;

  process.nextTick(function () {
    if (err) self.emit('error', err);
    self.emit('close')
  })
};

module.exports = function (opts) {
  return new CsvWriteStream(opts)
};

var escRe = /[|\\{}()[\]^$+*?.]/g;

function regEsc(str) {
  return str.replace(escRe, '\\$&');
}

function esc(cell) {
  return '"' + cell.replace(/"/g, '""') + '"'
}
