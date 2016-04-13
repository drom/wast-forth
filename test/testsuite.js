'use strict';

var fs = require('fs'),
    path = require('path'),
    g = require('../lib/').genforth,
    // expect = require('chai').expect,
    jsof = require('jsof');

var src = path.resolve(__dirname, '../wast-parser/results/');

var astFileNames = fs.readdirSync(src);
describe('codegen', function () {

    var startT = process.hrtime();
    before(function() {
      startT = process.hrtime();
    });

    astFileNames.forEach(function (name) {
        it(name, function (done) {
            if (name.match('^(.*)js$')) {
                fs.readFile(
                    path.resolve(src, name),
                    'utf8',
                    function (err, jsData) {
                        var ast;
                        if (err) { throw err; }
                        ast = jsof.p(jsData);
                        var res = g(ast);
                        console.log(res + '\n\n');
                        done();
                    }
                );
            } else {
                done();
            }
        });
    });

    after(function () {
      var diff = process.hrtime(startT);
      console.log('test took %d nanoseconds', diff[0] * 1e9 + diff[1]);
    });
});
