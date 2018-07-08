export declare const updateIn: SafeUpdate;
/** Core lens shape. Used to construct Lens and can be passed to higher-order functions, such as Lens.comp */
export interface ILens<T, V> {
    get(t: T): V;
    set(a: T, value: V): T;
}
/** An object which can be used for getting and copy-and-updating substructure of objects. */
export interface Lens<T, V> {
    /** Gets the value from the object */
    (t: T): V;
    /** Gets the value from the object */
    get(t: T): V;
    /** Given a value, returns a function which updates its argument to that value */
    set(v: V): (t: T) => T;
    /** Given an object and a value, updates the object's referenced state to that value. */
    set(t: T, v: V): T;
    /** Given a function that operates on a value, return a function that uses it to update an object's internal value */
    update(fn: (v: V) => V): (t: T) => T;
    /** Given an object and a function that operates on it's value, return an updated object. */
    update(t: T, fn: (v: V) => V): T;
    comp<V2>(l: Lens<V, V2>): Lens<T, V2>;
    comp<U, V2>(l1: Lens<V, U>, l2: Lens<U, V2>): Lens<T, V2>;
    comp<U1, U2, V2>(l1: Lens<V, U1>, l2: Lens<U1, U2>, l3: Lens<U2, V2>): Lens<T, V2>;
}
/** Core prism shape. Used to construct Prisms and can be passed to higher-order Prism functions, such as comp */
export interface IPrism<T, V> {
    get(t: T): V | Prism.NONE;
    set(t: T, value: V): T;
}
/** An object which can be used for getting and copy-and-updating potentially-undefined substructure of objects. Like lens, but used for optional things. */
export interface Prism<T, V> {
    (t: T): V | Prism.NONE;
    get(t: T): V | Prism.NONE;
    set(v: V): (t: T) => T;
    set(t: T, v: V): T;
    update(fn: Prism.Updater<V>): (t: T) => T;
    update(t: T, fn: Prism.Updater<V>): T;
    comp<V2>(l: Prism.Prismish<V, V2>): Prism<T, V2>;
}
/** A mapping to/from one type to another. Used with the `map` function to create a lens that operates on one type via another. */
export declare type Isomorphism<T, V> = {
    to: (t: T) => V;
    from: (v: V) => T;
};
/** Core module for creating and using prisms, which are get/set proxies that gracefully handle undefined. */
export declare namespace Prism {
    class _None {
    }
    type NONE = _None;
    const NONE: NONE;
    const isNone: <V>(v: _None | V) => v is _None;
    const isNotNone: <V>(v: _None | V) => v is V;
    type Updater<V> = (v: V | Prism.NONE) => V | Prism.NONE;
    function of<T, V>(spec: IPrism<T, V>): Prism<T, V>;
    type Prismish<T, U> = IPrism<T, U> | ILens<T, U>;
    function comp<T, U, V>(l1: Prismish<T, U>, l2: Prismish<U, V>): Prism<T, V>;
    function comp<T, U1, U2, V>(l1: Prismish<T, U1>, l2: Prismish<U1, U2>, l3: IPrism<U2, V>): Prism<T, V>;
    function comp<T, U1, U2, U3, V>(l1: Prismish<T, U1>, l2: Prismish<U1, U2>, l3: IPrism<U2, U3>, l4: Prismish<U3, V>): Prism<T, V>;
    function comp<T, U1, U2, U3, U4, V>(l1: Prismish<T, U1>, l2: Prismish<U1, U2>, l3: IPrism<U2, U3>, l4: Prismish<U3, U4>, l5: Prismish<U4, V>): Prism<T, V>;
}
/** Core module for dealing with lenses. Lenses are objects that make it easy to get and update nested structure in a composable, functional way. */
export declare namespace Lens {
    /** Returns a builder which can be used to create a lens that updates a simple object value or nested value */
    function from<T>(): LensFactory<T>;
    /** Creates a Lens from a simple get/set specification. */
    function of<T, V>(spec: ILens<T, V>): Lens<T, V>;
    /** Given a lens and a way to map that lens type to/from another (an isomorphism), returns a lens that can operate on the other type. */
    function map<T, U, V>(l: ILens<T, U>, f: Isomorphism<U, V>): Lens<T, V>;
    /** Compose together lenses for updating nested structures. */
    function comp<T, U, V>(l1: ILens<T, U>, l2: ILens<U, V>): Lens<T, V>;
    /** Compose together lenses for updating nested structures. */
    function comp<T, U1, U2, V>(l1: ILens<T, U1>, l2: ILens<U1, U2>, l3: ILens<U2, V>): Lens<T, V>;
    /** Compose together lenses for updating nested structures. */
    function comp<T, U1, U2, U3, V>(l1: ILens<T, U1>, l2: ILens<U1, U2>, l3: ILens<U2, U3>, l4: ILens<U3, V>): Lens<T, V>;
    /** Compose together lenses for updating nested structures. */
    function comp<T, U1, U2, U3, U4, V>(l1: ILens<T, U1>, l2: ILens<U1, U2>, l3: ILens<U2, U3>, l4: ILens<U3, U4>, l5: ILens<U4, V>): Lens<T, V>;
}
export interface SafeUpdate {
    <O, K1 extends keyof O>(o: O, k: K1, v: O[K1]): O;
    <O, K1 extends keyof O, K2 extends keyof O[K1]>(o: O, k: K1, k2: K2, v: O[K1][K2]): O;
    <O, K1 extends keyof O, K2 extends keyof O[K1], K3 extends keyof O[K1][K2]>(o: O, k: K1, k2: K2, k3: K3, v: O[K1][K2][K3]): O;
    <O, K1 extends keyof O, K2 extends keyof O[K1], K3 extends keyof O[K1][K2], K4 extends keyof O[K1][K2][K3]>(o: O, k: K1, k2: K2, k3: K3, k4: K4, v: O[K1][K2][K3][K4]): O;
    <O, K1 extends keyof O, K2 extends keyof O[K1], K3 extends keyof O[K1][K2], K4 extends keyof O[K1][K2][K3], K5 extends keyof O[K1][K2][K3][K4]>(o: O, k: K1, k2: K2, k3: K3, k4: K4, k5: K5, v: O[K1][K2][K3][K4][K5]): O;
}
export declare class LensFactory<O> {
    /** Creates lenses that access/update substructure via a keypath. */
    prop<K extends keyof O>(k: K): Lens<O, O[K]>;
    /** Creates lenses that access/update substructure via a keypath. */
    prop<K extends keyof O, K2 extends keyof O[K]>(k: K, k2: K2): Lens<O, O[K][K2]>;
    /** Creates lenses that access/update substructure via a keypath. */
    prop<K extends keyof O, K2 extends keyof O[K], K3 extends keyof O[K][K2]>(k: K, k2: K2, k3: K3): Lens<O, O[K][K2][K3]>;
    /** Creates lenses that access/update substructure via a keypath. */
    prop<K extends keyof O, K2 extends keyof O[K], K3 extends keyof O[K][K2], K4 extends keyof O[K][K2][K3]>(k: K, k2: K2, k3: K3, k4: K4): Lens<O, O[K][K2][K3][K4]>;
}
