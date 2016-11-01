#!/usr/bin/env node
'use strict';

// wast2stack.js --source fac.wast --output fac.stack

var fs = require('fs-extra'),
    path = require('path'),
    wastParser = require('wast-parser'),
    lib = require('../lib'),
    yargs = require('yargs');

var argv = yargs.argv;

if ((argv.source !== undefined) && (argv.output !== undefined)) {
    var srcPath = path.resolve(process.cwd(), argv.source);
    var outPath = path.resolve(process.cwd(), argv.output);
    fs.readFile(srcPath, 'utf-8', function (err0, srcFileBody) {
        if (err0) {
            throw err0;
        }
        var ast = wastParser.parse(srcFileBody);
        var res = lib.genstack(ast);
        fs.outputFile(
            outPath,
            res,
            'utf-8',
            function (err1) {
                if (err1) {
                    throw err1;
                }
            }
        );
    });
}
