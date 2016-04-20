'use strict';

var traverse = require('wast-traverse');

// var alu = {
//     add: '+',
//     sub: '-',
//     mul: '*',
//     div: '/'
// };

function getName (node) {
    var res = ':';
    if (node.id) {
        res += ' ' + node.id.name;
    } else {
        res += 'noname';
    }
    return res;
}

function getParams (node) {
    var res;
    var params = { i32: [], i64: [], f32: [], f64: [] };
    var result = { i32: [], i64: [], f32: [], f64: [] };
    traverse (node, {
        enter: function (node, parent) {
            switch (node.kind) {
            case 'result':
                result[node.type].push('res');
                break;
            case 'item':
                if (parent && (parent.kind === 'param')) {
                    params[node.type].push(node.name);
                }
                break;
            }
        }
    });
    res = '';
    Object.keys(params).forEach(function (type) {
        if (params[type].length || result[type].length) {
            res += ' ( ' + type + ': ';
            res += params[type].join(' ');
            res += ' -- ';
            res += result[type].join(' ');
            res += ' )';
        }
    });
    return res;
}


function genFunc (node) {
    var res = '';

    res += getName(node);

    res += getParams(node);

    traverse (node, {
        leave: function (node, parent, tail) {
            switch (node.kind) {

            case 'get_local':
                res += ' ' + node.id.name + '@';
                break;
            case 'call_import':
                res += ' ' + node.id.name;
                break;
            case 'binop':
            case 'unop':
            case 'cvtop':
            case 'relop':
                res += ' ' + node.type + '.' + node.operator;
                break;
            case 'const':
                res += ' ' + node.type + ':' + node.init;
                break;
            case 'load':
                res += ' ' + node.type + '@';
                break;
            case 'store':
                res += ' ' + node.type + '!';
                break;
            case 'call_import':

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

    res += ' ;\n';
    return res;
}

function genforth (node) {
    var res = '';
    traverse(node, {
        enter: function (node) {
            if (node.kind === 'func') {
                res += genFunc(node);
            }
        }
    });
    return res;
}

module.exports = genforth;
