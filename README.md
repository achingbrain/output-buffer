# output-buffer <!-- omit in toc -->

[![codecov](https://img.shields.io/codecov/c/github/achingbrain/output-buffer.svg?style=flat-square)](https://codecov.io/gh/achingbrain/output-buffer)
[![CI](https://img.shields.io/github/workflow/status/achingbrain/output-buffer/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/achingbrain/output-buffer/actions/workflows/js-test-and-release.yml)

> Buffers your outputs and calls a function when a linebreak is found

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
  - [Specifying a line separator](#specifying-a-line-separator)
  - [Finding the size of the buffer](#finding-the-size-of-the-buffer)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i output-buffer
```

Buffers your output.  When line separators are detected, it calls the function passed to the constructor with the line of data.

## Usage

```javascript
import { OutputBuffer } from 'output-buffer'

const buffer = new OutputBuffer(console.info)
buffer.append('foo')
buffer.append('bar')
buffer.append('\n')  // prints 'foobar'
buffer.append('foo')
buffer.append('ba\nr') // prints fooba
buffer.flush() // prints 'r'
```

### Specifying a line separator

The default line separator is the regex `/\r\n|\r|\n/` - this will handle CRLF, CR or LF.

A custom separator (string or regex) can be supplied as a second argument to the constructor, e.g.:

```javascript
const buffer = new OutputBuffer(console.info, '\r\n')
```

or:

```javascript
const buffer = new OutputBuffer(console.info, /\r\n/)
```

### Finding the size of the buffer

`buffer.size()` will return how many characters have yet to be passed to the callback.

```javascript
const buffer = new OutputBuffer(console.info, '\r\n')

console.info(buffer.size()) // prints 0

buffer.append('foo')

console.info(buffer.size()) // prints 3

buffer.append('bar/n')

console.info(buffer.size()) // prints 0
```

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
