'use strict';

var traverse = require('wast-traverse');

var alu = {
    add: '+'
}

function genforth (node) {
    var res = '';
    traverse(node, {
        enter: function (node, parent) {
            if (node.kind === 'identifier') {
                switch (parent.kind) {
                case 'func': res += ' : ' + node.name; break;
                case 'get_local': res += ' ' + node.name + '@'; break;
                }
            }
        },
        leave: function (node) {
            switch(node.kind) {
            case 'func':
                res += ' ; ';
                break;
            case 'binop':
                res += ' ' + alu[node.operator];
                break;
            }
        }
    });
    return res;
}

module.exports = genforth;
