# OutputBuffer

[![Build Status](https://travis-ci.org/achingbrain/output-buffer.svg)](https://travis-ci.org/achingbrain/output-buffer) [![Dependency Status](https://david-dm.org/achingbrain/output-buffer.svg)](https://david-dm.org/achingbrain/output-buffer) [![Coverage Status](https://img.shields.io/coveralls/achingbrain/output-buffer/master.svg)](https://coveralls.io/r/achingbrain/output-buffer)


Buffers your output.  When newlines are detected, it calls the function passed to the constructor with the line of data.

## Usage

```javascript
var OutputBuffer = require('outputbuffer')

var buffer = new OutputBuffer(console.info)
buffer.append('foo')
buffer.append('bar')
buffer.append('\n')  // prints 'foobar'
buffer.append('foo')
buffer.append('ba\nr') // prints fooba
buffer.flush() // prints 'r'
```
