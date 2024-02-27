const babel = require('@babel/core');
const parser = require('@babel/parser');

function transformDEVPlugin ({types, template}) {
    return {
        visitor: {
            Identifier: {
                enter(path, state) {
                    if (path.isIdentifier({ name: '__DEV__' }) && path.scope.hasGlobal('__DEV__')) {
                        path.replaceWith(
                            parser.parseExpression(state.opts.expr)
                        );
                    }
                }
            }
        }
    };
};


module.exports.transform = function (sourceCode, sourcemap, expr) {
    let {code, map} = babel.transformSync(sourceCode, {
        plugins: [ [transformDEVPlugin, {
            expr: expr || 'process.env.NODE_ENV !== \'production\''
        }] ],
        compact: false,
        sourceMaps: sourcemap
    });

    return {code, map};
};

/**
 * @param {string} code
 * @throws {Error} If check failed.
 */
module.exports.recheckDEV = function (code) {
    return code.indexOf('process.env.NODE_ENV') >= 0;
};
