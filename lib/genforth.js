'use strict';

var traverse = require('wast-traverse');

// var alu = {
//     add: '+',
//     sub: '-',
//     mul: '*',
//     div: '/'
// };

var words = {
    load:  { i32: '@', i64: '2@', f32: 'f@', f64: '2f@' },
    store: { i32: '!', i64: '2!', f32: 'f!', f64: '2f!' },
    alu: {
        i32: {
            add: '+',   sub: '-',  mul: '*',
            div_s: '/', div_u: 'u/',
            rem_s: 'rem', rem_u: 'urem',
            and: 'and', or:  'or', xor: 'xor',
            shl: 'lshift', shr_s: 'rshift', shr_u: 'urshift',
            eq: '=', ne: '= invert',
            lt_s: '<',  le_s: '<=',  gt_s: '>',  ge_s: '>=',
            lt_u: 'u<', le_u: 'u<=', gt_u: 'u>', ge_u: 'u>=',
            eqz: '0=',
            min: 'min', max: 'max'
        },
        i64: {
            add: 'd+', sub: 'd-', mul: 'd*', div: 'd/',
            and: '2and', or:  '2or', xor: '2xor',
            eq: 'd=', ne: 'd= 2invert', lt: 'd<', le: 'd<=', gt: 'd>', ge: 'd>=',
        },
        f32: {
            add: 'f+', sub: 'f-', mul: 'f*', div: 'f/'
        },
        f64: { add: 'F+', sub: 'F-', mul: 'F*', div: 'F/' }
    }
}

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
                res += ' ' + (words.alu[node.type][node.operator] || (node.type+ '.' + node.operator));
                break;
            case 'const':
                res += ' ' + node.init;
                break;
            case 'load':
                res += ' ' + words.load[node.type];
                break;
            case 'store':
                res += ' ' + words.store[node.type];
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
