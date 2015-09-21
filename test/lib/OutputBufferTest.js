var expect = require('chai').expect
var sinon = require('sinon')
var OutputBuffer = require('../../lib/OutputBuffer')
var describe = require('mocha').describe
var it = require('mocha').it

describe('OutputBuffer', function () {
  it('should buffer output', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
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
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo\nbar\nbaz')

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
  })

  it('should emit an unterminated line with flush', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo\nbar\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should flush a trailing zero', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo\nbar\nbaz\n0')
    buffer.flush()

    expect(output.callCount).to.equal(4)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
    expect(output.getCall(3).args[0]).to.equal('0')
  })

  it('should split lines on CR', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo\rbar\rbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should split lines on LF', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo\nbar\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should split lines on CRLF', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo\r\nbar\r\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should split lines on any combination of CR, LF and CRLF', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo\rbar\nbaz\r\nquux')
    buffer.flush()

    expect(output.callCount).to.equal(4)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
    expect(output.getCall(3).args[0]).to.equal('quux')
  })

  it('should handle a leading line terminator', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('\rfoo\nbar\r\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(4)
    expect(output.getCall(0).args[0]).to.equal('')
    expect(output.getCall(1).args[0]).to.equal('foo')
    expect(output.getCall(2).args[0]).to.equal('bar')
    expect(output.getCall(3).args[0]).to.equal('baz')
  })

  it('should handle a trailing line terminator', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo\rbar\nbaz\r\n')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should handle a leading and trailing line terminator', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('\rfoo\nbar\r\n')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('')
    expect(output.getCall(1).args[0]).to.equal('foo')
    expect(output.getCall(2).args[0]).to.equal('bar')
  })

  it('should treat LFCR as two line separators', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo\n\rbar')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('')
    expect(output.getCall(2).args[0]).to.equal('bar')
  })

  it('should treat LFCRLF as two line separators', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo\n\r\nbar')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('')
    expect(output.getCall(2).args[0]).to.equal('bar')
  })

  it('should handle empty strings', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
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
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo')
    buffer.append(null)
    buffer.append('bar\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foobar')
    expect(output.getCall(1).args[0]).to.equal('baz')
  })

  it('should ignore undefined values', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append('foo')
    buffer.append(undefined)
    buffer.append('bar\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foobar')
    expect(output.getCall(1).args[0]).to.equal('baz')
  })

  it('should allow the line separator to be supplied as a string', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output, '\n')
    buffer.append('foo\r\nbar\r\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo\r')
    expect(output.getCall(1).args[0]).to.equal('bar\r')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should allow the line separator to be supplied as a regex', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output, /\n/)
    buffer.append('foo\r\nbar\r\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo\r')
    expect(output.getCall(1).args[0]).to.equal('bar\r')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should use the default line separator if the separator is falsey', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output, '')
    buffer.append('foo\r\nbar\r\nbaz')
    buffer.flush()

    expect(output.callCount).to.equal(3)
    expect(output.getCall(0).args[0]).to.equal('foo')
    expect(output.getCall(1).args[0]).to.equal('bar')
    expect(output.getCall(2).args[0]).to.equal('baz')
  })

  it('should buffer buffers', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output)
    buffer.append(new Buffer('foo'))
    buffer.append(new Buffer('foo'))
    buffer.append(new Buffer('fo\no'))
    buffer.append(new Buffer('foo'))
    buffer.flush()
    buffer.flush()

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foofoofo')
    expect(output.getCall(1).args[0]).to.equal('ofoo')
  })

  it('should buffer buffers with a string separator', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output, '-')
    buffer.append(new Buffer('foo'))
    buffer.append(new Buffer('foo'))
    buffer.append(new Buffer('fo-o'))
    buffer.append(new Buffer('foo'))
    buffer.flush()
    buffer.flush()

    expect(output.callCount).to.equal(2)
    expect(output.getCall(0).args[0]).to.equal('foofoofo')
    expect(output.getCall(1).args[0]).to.equal('ofoo')
  })

  it('should buffer output split with multi character string', function () {
    var output = sinon.stub()

    var buffer = new OutputBuffer(output, '--break--')
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
})
