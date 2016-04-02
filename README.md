[![Build Status](https://travis-ci.org/drom/wast-forth.svg?branch=master)](https://travis-ci.org/drom/wast-forth)
# wast-forth

WebAssembly AST :point_right: Forth


## Usage

### Install

```
npm i wast-forth
```

### CLI

```
genforth test.wast > test.forth
```

### As a library

```js
var p = require('wast-praser').parse,
    g = require('wast-forth').genforth;

console.log(g(p('(module )')));
// =>
```
