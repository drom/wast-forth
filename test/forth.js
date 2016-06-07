'use strict';

var lib = require('../lib'),
    expect = require('chai').expect;

describe('forth', function () {
    it('dup', function (done) {
        expect(lib.forth(': foo dup ;')).to.deep.eq({});
        done();
    });
});
