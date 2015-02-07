'use strict';

var OutputBuffer = require('../lib/OutputBuffer');
var assert       = require('assert');
var Benchmark    = require('benchmark');
var benchmarks   = require('beautify-benchmark');

var stringSplitBuffer = new OutputBuffer(null, '\n');
var regexSplitBuffer  = new OutputBuffer();
var oldBuffer         = new OutputBuffer();
var suite             = new Benchmark.Suite();

var LINE  = 'The quick brown fox jumps over the lazy dog.';
var LINES = [ LINE + LINE, LINE, LINE, LINE, LINE + LINE ];

oldBuffer.append = function (data) {
    this._buffer += data
    var index = this._buffer.indexOf('\n')

    while (index != -1) {
        var sub = this._buffer.substring(0, index)

        this._out(sub)

        this._buffer = this._buffer.substring(index + 1)
        index = this._buffer.indexOf('\n')
    }
};

function addTest (name, buffer) {
    suite.add(name, function () {
        var lines = [];

        buffer._out = function (line) {
            lines.push(line);
        };

        buffer.append(LINE);
        buffer.append(LINE);
        buffer.append('\n' + LINE);
        buffer.append('\n' + LINE + '\n');
        buffer.append(LINE + '\n');
        buffer.append(LINE);
        buffer.append(LINE);
        buffer.flush();

        assert.deepEqual(lines, LINES);
    });
}

addTest('string-split buffer', stringSplitBuffer);
addTest('regex-split buffer', regexSplitBuffer);
addTest('old buffer', oldBuffer);

suite.on('cycle', function (event) {
    benchmarks.add(event.target);
});

suite.on('start', function () {
    console.log('Starting...\n');
});

suite.on('complete', function () {
    benchmarks.log();
});

suite.run({ async: false });
