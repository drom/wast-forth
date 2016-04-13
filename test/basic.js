'use strict';

var p = require('wast-parser').parse,
    g = require('../lib/').genforth,
    expect = require('chai').expect;

describe('basic', function () {
    it('t0', function (done) {
        var ast = p('(module (func $add (param $a i32) (param $b i32) (result i32) (i32.add (get_local $a) (get_local $b))))');
        var frt = g(ast);
        expect(frt).to.eq(' : add a@ b@ + ;\n')
        done();
    });
});
