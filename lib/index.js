"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
/** Given an object, a sequence of keys, and a value, deep update that value by recursively copying. Type safe. */
var _generalUpdater = makeUpdater();
exports.updateIn = function (o) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return _generalUpdater(o, args[args.length - 1], args, 0, args.length - 2);
};
/** Core module for creating and using prisms, which are get/set proxies that gracefully handle undefined. */
var Prism;
(function (Prism) {
    var None = /** @class */ (function () {
        function None() {
        }
        return None;
    }());
    Prism.NONE = new None();
    Prism.isNone = function (v) { return v === Prism.NONE; };
    Prism.isNotNone = function (v) { return v !== Prism.NONE; };
    function of(spec) {
        var func = (function (o) { return spec.get(o); });
        function set(tOrV, v) {
            if (arguments.length === 1)
                return function (t) { return spec.set(t, tOrV); };
            return spec.set(tOrV, v);
        }
        function update(tOrFn, fn) {
            if (arguments.length === 1)
                return function (t) { return func.update(t, tOrFn); };
            var t = tOrFn;
            var v = spec.get(t);
            if (Prism.isNone(v))
                return t;
            v = fn(v);
            return Prism.isNotNone(v) ? spec.set(t, v) : t;
        }
        var comp = Prism.comp.bind(undefined, func);
        func.get = spec.get;
        func.set = set;
        func.update = update;
        func.comp = comp;
        return func;
    }
    Prism.of = of;
    function comp() {
        var prisms = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            prisms[_i] = arguments[_i];
        }
        var performComposedSet;
        return Prism.of({
            get: function (t) {
                return prisms.reduce(function (prevT, p) { return Prism.isNone(prevT) ? Prism.NONE : p.get(prevT); }, t);
            },
            set: function (t, v) {
                if (performComposedSet === undefined) {
                    performComposedSet = makeComposedSetter();
                }
                return performComposedSet(t, v, prisms, 0);
            }
        });
    }
    Prism.comp = comp;
})(Prism = exports.Prism || (exports.Prism = {}));
/** Core module for dealing with lenses. Lenses are objects that make it easy to get and update nested structure in a composable, functional way. */
var Lens;
(function (Lens) {
    /** Returns a builder which can be used to create a lens that updates a simple object value or nested value */
    function from() {
        return new LensFactory();
    }
    Lens.from = from;
    /** Creates a Lens from a simple get/set specification. */
    function of(spec) {
        return Prism.of(spec);
    }
    Lens.of = of;
    /** Given a lens and a way to map that lens type to/from another (an isomorphism), returns a lens that can operate on the other type. */
    function map(l, f) {
        return Lens.of({
            get: function (o) { return f.to(l.get(o)); },
            set: function (o, v) { return l.set(o, f.from(v)); }
        });
    }
    Lens.map = map;
    /** Compose together lenses for updating nested structures. */
    function comp() {
        var lenses = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lenses[_i] = arguments[_i];
        }
        return Prism.comp.apply(undefined, lenses);
    }
    Lens.comp = comp;
})(Lens = exports.Lens || (exports.Lens = {}));
/** Factory to create monomorphic composed setters */
function makeComposedSetter() {
    var performComposedSet = function (o, v, prisms, index) {
        if (index == prisms.length - 1) {
            return prisms[index].set(o, v);
        }
        else {
            var inner = prisms[index].get(o);
            if (Prism.isNotNone(inner)) {
                return prisms[index].set(o, performComposedSet(inner, v, prisms, index + 1));
            }
            else {
                return o;
            }
        }
    };
    return performComposedSet;
}
/** Factory to create monomorphic updaters */
function makeUpdater() {
    var performUpdate = function (o, v, keys, idx, last) {
        var copy = __assign({}, o);
        if (idx == last) {
            copy[keys[idx]] = v;
            return copy;
        }
        else {
            copy[keys[idx]] = performUpdate(o[keys[idx]], v, keys, idx + 1, last);
            return copy;
        }
    };
    return performUpdate;
}
var LensFactory = /** @class */ (function () {
    function LensFactory() {
    }
    LensFactory.prototype.prop = function () {
        var ks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ks[_i] = arguments[_i];
        }
        var performUpdate;
        return Lens.of({
            get: function (o) {
                return ks.reduce(function (x, k) { return x[k]; }, o);
            },
            set: function (o, v) {
                if (performUpdate === undefined) {
                    performUpdate = makeUpdater();
                }
                return performUpdate(o, v, ks, 0, ks.length - 1);
            }
        });
    };
    return LensFactory;
}());
exports.LensFactory = LensFactory;
//# sourceMappingURL=index.js.map