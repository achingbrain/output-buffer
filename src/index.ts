import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const DEFAULT_SEPARATOR = /\r\n|\r|\n/

export class OutputBuffer {
  private readonly _out: (string: string) => void
  private readonly _sep: RegExp | string
  private _buffer: string
  private readonly _append: (data: Uint8Array | string) => void

  constructor (out: (string: string) => void, sep: RegExp | string = DEFAULT_SEPARATOR) {
    this._out = out
    this._sep = sep ?? DEFAULT_SEPARATOR

    if (!Boolean(this._sep)) {
      this._sep = DEFAULT_SEPARATOR
    }

    this._buffer = ''
    this._append = ({}.toString.call(this._sep) === '[object RegExp]') ? this._regexSplitAppend : this._stringSplitAppend
  }

  append (data: Uint8Array | string) {
    if (data != null) {
      this._append(data)
    }
  }

  _stringSplitAppend (data: Uint8Array | string) {
    if (data instanceof Uint8Array) {
      data = uint8ArrayToString(data, 'utf8')
    }

    const sep = this._sep.toString()
    let index: number
    let sub: string

    this._buffer += data
    index = this._buffer.indexOf(sep)

    while (index !== -1) {
      sub = this._buffer.substring(0, index)

      this._out(sub)

      this._buffer = this._buffer.substring(index + sep.length)
      index = this._buffer.indexOf(sep)
    }
  }

  _regexSplitAppend (data: Uint8Array | string) {
    if (data instanceof Uint8Array) {
      data = uint8ArrayToString(data, 'utf8')
    }

    const lines = data.split(this._sep)
    const len = lines.length
    let last, i

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

  flush () {
    if (this._buffer.length > 0) {
      this._out(this._buffer)
      this._buffer = ''
    }
  }

  size () {
    return this._buffer.length
  }
}
