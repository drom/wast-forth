'use strict';

var traverse = require('wast-traverse');

var alu = {
    add: '+'
}

function genforth (node) {
    var res = '';
    traverse(node, {
        enter: function (node, parent) {
            switch (node.kind) {
            case 'func':
                res += ':';
                if (node.id) {
                    res += ' ';
                } else {
                    res += 'noname';
                }
                break;
            case 'identifier':
                switch (parent.kind) {
                case 'func':
                    res += node.name;
                    break;
                case 'get_local':
                    res += ' ' + node.name + '@';
                    break;
                }
            }
        },
        leave: function (node, parent, tail) {
            switch (node.kind) {
            case 'func':
                res += ' ;\n';
                break;
            case 'binop':
                res += ' ' + alu[node.operator];
                break;
            }
            if (parent) {
                switch (parent.kind) {
                case 'if':
                    switch (tail) {
                    case 'test':
                        res += ' if';
                        break;
                    case 'then':
                        res += ' then';
                        break;
                    case 'else':
                        res += ' else';
                        break;
                    }
                    break;
                }
            }
        }
    });
    return res;
}

module.exports = genforth;
