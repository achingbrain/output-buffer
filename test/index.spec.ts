import { expect } from 'aegir/chai'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { OutputBuffer } from '../src/index.js'

describe('OutputBuffer', function () {
  it('should buffer output', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo')
    buffer.append('foo')
    buffer.append('fo\no')
    buffer.append('foo')
    buffer.flush()
    buffer.flush()

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foofoofo')
    expect(output.getCall(1).args[0]).to.equal('ofoo')
  })

  it('should not emit an unterminated line without flush', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\nbar\nbaz')

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
  })

  it('should emit an unterminated line with flush', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\nbar\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should flush a trailing zero', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\nbar\nbaz\n0')
    buffer.flush()

    expect(output.callCount).to.equal(4)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
    expect(output.getCall(3).args[0]).to.equal('0')
  })

  it('should split lines on CR', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\rbar\rbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should split lines on LF', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\nbar\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should split lines on CRLF', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\r\nbar\r\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should split lines on any combination of CR, LF and CRLF', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\rbar\nbaz\r\nquux')
    buffer.flush()

    expect(output.callCount).to.equal(4)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
    expect(output.getCall(3).args[0]).to.equal('quux')
  })

  it('should handle a leading line terminator', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('\rfoo\nbar\r\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(4)
    expect(output.getCall(0).args[0]).to.equal('')
    expect(output.getCall(1).args[0]).to.equal('foo')
    expect(output.getCall(2).args[0]).to.equal('bar')
    expect(output.getCall(3).args[0]).to.equal('baz')
  })

  it('should handle a trailing line terminator', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\rbar\nbaz\r\n')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should handle a leading and trailing line terminator', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('\rfoo\nbar\r\n')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('')
    expect(output.getCall(1).args[0]).to.equal('foo')
    expect(output.getCall(2).args[0]).to.equal('bar')
  })

  it('should treat LFCR as two line separators', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\n\rbar')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('')
    expect(output.getCall(2).args[0]).to.equal('bar')
  })

  it('should treat LFCRLF as two line separators', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\n\r\nbar')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('')
    expect(output.getCall(2).args[0]).to.equal('bar')
  })

  it('should handle empty strings', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo\n')
    buffer.append('')
    buffer.append('\nbar')
    buffer.append('')
    buffer.append('')
    buffer.append('\nbaz\n')
    buffer.append('')
    buffer.append('')
    buffer.append('')
    buffer.append('quux')
    buffer.flush()

    expect(output.callCount).to.equal(5)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('')
    expect(output.getCall(2).args[0]).to.equal('bar')
    expect(output.getCall(3).args[0]).to.equal('baz')
    expect(output.getCall(4).args[0]).to.equal('quux')
  })

  it('should ignore null values', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo')
    // @ts-expect-error incorrect type
    buffer.append(null)
    buffer.append('bar\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foobar')
    expect(output.getCall(1).args[0]).to.equal('baz')
  })

  it('should ignore undefined values', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append('foo')
    // @ts-expect-error incorrect type
    buffer.append(undefined)
    buffer.append('bar\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foobar')
    expect(output.getCall(1).args[0]).to.equal('baz')
  })

  it('should allow the line separator to be supplied as a string', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output, '\n')
    buffer.append('foo\r\nbar\r\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo\r')
    expect(output.getCall(1).args[0]).to.equal('bar\r')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should allow the line separator to be supplied as a regex', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output, /\n/)
    buffer.append('foo\r\nbar\r\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo\r')
    expect(output.getCall(1).args[0]).to.equal('bar\r')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should use the default line separator if the separator is falsey', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output, '')
    buffer.append('foo\r\nbar\r\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should buffer buffers', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)
    buffer.append(uint8ArrayFromString('foo'))
    buffer.append(uint8ArrayFromString('foo'))
    buffer.append(uint8ArrayFromString('fo\no'))
    buffer.append(uint8ArrayFromString('foo'))
    buffer.flush()
    buffer.flush()

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foofoofo')
    expect(output.getCall(1).args[0]).to.equal('ofoo')
  })

  it('should buffer buffers with a string separator', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output, '-')
    buffer.append(uint8ArrayFromString('foo'))
    buffer.append(uint8ArrayFromString('foo'))
    buffer.append(uint8ArrayFromString('fo-o'))
    buffer.append(uint8ArrayFromString('foo'))
    buffer.flush()
    buffer.flush()

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foofoofo')
    expect(output.getCall(1).args[0]).to.equal('ofoo')
  })

  it('should buffer output split with multi character string', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output, '--break--')
    buffer.append('foo')
    buffer.append('foo')
    buffer.append('fo--break--o')
    buffer.append('foo')
    buffer.flush()
    buffer.flush()

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foofoofo')
    expect(output.getCall(1).args[0]).to.equal('ofoo')
  })

  it('should return how many characters are currently buffered', function () {
    const output = sinon.stub()

    const buffer = new OutputBuffer(output)

    expect(buffer.size()).to.equal(0)

    buffer.append('foo')

    expect(buffer.size()).to.equal(3)

    buffer.flush()

    expect(buffer.size()).to.equal(0)
  })
})
