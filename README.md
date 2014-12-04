# OutputBuffer

[![Build Status](https://travis-ci.org/achingbrain/outputbuffer.svg)](https://travis-ci.org/achingbrain/outputbuffer) [![Dependency Status](https://david-dm.org/achingbrain/outputbuffer.svg)](https://david-dm.org/achingbrain/outputbuffer) [![Coverage Status](https://img.shields.io/coveralls/achingbrain/outputbuffer/master.svg)](https://coveralls.io/r/achingbrain/outputbuffer)


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
