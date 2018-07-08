"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var Arrays;
(function (Arrays) {
    /** Returns a Prism for the specified array index */
    function index(n) {
        function index(a, n) {
            if (n < 0 || n >= a.length) {
                return undefined;
            }
            return n;
        }
        return index_1.Prism.of({
            get: function (a) {
                var i = index(a, n);
                return i !== undefined ? a[i] : index_1.Prism.NONE;
            },
            set: function (a, v) {
                var i = index(a, n);
                if (i === undefined) {
                    return a;
                }
                var copy = a.slice();
                copy[i] = v;
                return copy;
            }
        });
    }
    Arrays.index = index;
    /** Like Array#splice but returns a copy */
    function splice(a, i, del) {
        var add = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            add[_i - 3] = arguments[_i];
        }
        return a.slice(0, i).concat(add, a.slice(i + del, a.length));
    }
    Arrays.splice = splice;
    /** Like Array#pop but returns a copy */
    function pop(a) {
        return splice(a, a.length - 1, 1);
    }
    Arrays.pop = pop;
    /** Like Array#push but returns a copy */
    function push(a, t) {
        return splice(a, a.length, 0, t);
    }
    Arrays.push = push;
    /** Like Array#unshift but returns a copy */
    function unshift(a, t) {
        return splice(a, 0, 0, t);
    }
    Arrays.unshift = unshift;
    /** Like Array#shift but returns a copy */
    function shift(a) {
        return splice(a, 0, 1);
    }
    Arrays.shift = shift;
})(Arrays = exports.Arrays || (exports.Arrays = {}));
//# sourceMappingURL=arrays.js.map