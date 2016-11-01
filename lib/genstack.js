'use strict';

var traverse = require('wast-traverse');

function getHeader (node) {
    var res = '';
    var params = [];
    var result = [];
    traverse (node, {
        enter: function (node, parent) {
            switch (node.kind) {
            case 'result':
                result.push(node);
                break;
            case 'item':
                if (parent && (parent.kind === 'param')) {
                    params.push(node);
                }
                break;
            }
        }
    });
    res += '\nfunction ';
    res += ((node.id && node.id.name || 'noname') + ' '.repeat(40)).substr(0, 18);
    res += '// ';
    res += params.map(function (e, i) {
        return '$' + (e.name || i) + ':' + e.type;
    }).join(' ');
    res += ' -- ';
    res += result.map(function (e) {
        return e.type;
    }).join(' ');
    res += '\n';
    return { params: params, result: result, res: res };
}


function genFunc (node) {

    var stack = [];
    var csStack = [];

    function findOnStack (label) {
        var res = [-1, '???'];
        stack.some(function (e, i) {
            console.log(e, label, e.search(label));
            if (e.search(label) !== -1) {
                res = [stack.length - i, e];
                return true;
            }
        });
        return res;
    }

    function addStack (line) {
        if (line === '') {
            return '';
        }
        return (line + ' '.repeat(100)).substr(0, 27) + '// ' + stack.join(' ');
    }

    var header = getHeader(node);
    var res = header.res;
    var paramIndex = 0;

    traverse (node, {
        leave: function (node, parent, tail) {

            var pre = '  '.repeat(csStack.length + 1);
            var line;
            var post = '\n';
            var findRes = [];
            switch (node.kind) {

            case 'item':
                if (parent) {
                    switch (parent.kind) {
                    case 'param':
                        pre = ''; line = ''; post = '';
                        stack.push(node.type + ':$' + (node.name || paramIndex));
                        paramIndex++;
                        break;
                    case 'local':
                        line = node.type + '.const 0';
                        stack.push(node.type + ':$' + (node.name || paramIndex));
                        paramIndex++;
                        break;
                    }
                }
                break;
            case 'const':
                line = node.type + '.' + node.kind + ' ' + node.init;
                stack.push(node.type);
                break;
            case 'get_local':
                findRes = findOnStack('$' + (node.id.name || node.id.value));
                line = 'pick ' + findRes[0];
                stack.push(findRes[1]);
                break;
            case 'binop':
            case 'relop':
                line = node.type + '.' + node.operator;
                stack.pop();
                stack.pop();
                stack.push(node.type);
                break;

            case 'call':
            case 'call_import':
                line = node.kind + ' ' + node.id.name;
                break;
            case 'unop':
            case 'cvtop':
                line = node.type + '.' + node.operator;
                break;
            case 'load':
            case 'store':
                line = node.type + '.' + node.kind;
                break;
            case 'call_import':
                break;
            default:
                pre = ''; line = ''; post = '';
                // line = '// ' + node.type + ':' + node.kind;
            }

            res += addStack(pre + line) + post;

            if (parent && parent.kind === 'if') {
                switch (tail) {
                case 'test':
                    stack.pop();
                    csStack.push(1);
                    line = 'if';
                    break;
                case 'then':
                    line = 'else';
                    pre = pre.slice(0, -2);
                    break;
                case 'else':
                    csStack.pop();
                    line = 'endif';
                    pre = pre.slice(0, -2);
                    break;
                }
                res += addStack(pre + line) + post;
            }
        }
    });

    res += 'endfunction\n';
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
