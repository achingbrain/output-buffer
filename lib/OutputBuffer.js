
function stringSplitAppend (data) {
  if (Buffer.isBuffer(data)) {
    data = data.toString('utf8')
  }

  var sep, index, sub

  sep = this._sep
  this._buffer += data
  index = this._buffer.indexOf(sep)

  while (index !== -1) {
    sub = this._buffer.substring(0, index)

    this._out(sub)

    this._buffer = this._buffer.substring(index + sep.length)
    index = this._buffer.indexOf(sep)
  }
}

function regexSplitAppend (data) {
  if (Buffer.isBuffer(data)) {
    data = data.toString('utf8')
  }

  var lines = data.split(this._sep)
  var len = lines.length
  var last, i

  switch (len) {
    case 1: // no line terminators
      this._buffer += lines[0]
      break
    case 2: // one line terminator
      this._out(this._buffer + lines[0])
      this._buffer = lines[1]
      break
    default: // more than one line terminator
      last = len - 1
      this._out(this._buffer + lines[0])
      for (i = 1; i < last; ++i) {
        this._out(lines[i])
      }
      this._buffer = lines[last]
  }
}

var OutputBuffer = function (out, sep) {
  this._out = out
  this._sep = sep || /\r\n|\r|\n/
  this._buffer = ''
  this._append = ({}.toString.call(this._sep) === '[object RegExp]') ? regexSplitAppend : stringSplitAppend
}

OutputBuffer.prototype.append = function (data) {
  if (data != null) {
    this._append(data)
  }
}

OutputBuffer.prototype.flush = function () {
  if (this._buffer) {
    this._out(this._buffer)
    this._buffer = ''
  }
}

module.exports = OutputBuffer
