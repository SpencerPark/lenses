/** Given an object, a sequence of keys, and a value, deep update that value by recursively copying. Type safe. */
let _generalUpdater = makeUpdater();
export const updateIn: SafeUpdate = function(o: any, ...args: any[]) {
  return _generalUpdater(o, args[args.length - 1], args, 0, args.length-2);
}

/** Core lens shape. Used to construct Lens and can be passed to higher-order functions, such as Lens.comp */
export interface ILens<T, V> {
  get(t: T): V;
  set(a: T, value: V): T
}

/** An object which can be used for getting and copy-and-updating substructure of objects. */
export interface Lens<T,V> {
  /** Gets the value from the object */
  (t:T): V;
  /** Gets the value from the object */
  get(t:T): V;

  /** Given a value, returns a function which updates its argument to that value */
  set(v:V): (t:T) => T;
  /** Given an object and a value, updates the object's referenced state to that value. */
  set(t:T, v:V): T;

  /** Given a function that operates on a value, return a function that uses it to update an object's internal value */
  update(fn: (v:V) => V): (t:T) => T;
  /** Given an object and a function that operates on it's value, return an updated object. */
  update(t:T, fn: (v:V) => V): T;

  comp<V2>(l: Lens<V, V2>): Lens<T, V2>;
  comp<U,V2>(l1: Lens<V, U>, l2: Lens<U, V2>): Lens<T, V2>;
  comp<U1,U2,V2>(l1: Lens<V, U1>, l2: Lens<U1, U2>, l3: Lens<U2, V2>): Lens<T, V2>;
}

/** Core prism shape. Used to construct Prisms and can be passed to higher-order Prism functions, such as comp */
export interface IPrism<T, V> {
  get(t: T): V | Prism.NONE;
  set(t: T, value: V): T
}

/** An object which can be used for getting and copy-and-updating potentially-undefined substructure of objects. Like lens, but used for optional things. */
export interface Prism<T,V> {
  (t:T): V | Prism.NONE;
  get(t:T): V | Prism.NONE;

  set(v:V): (t:T) => T;
  set(t:T, v:V): T;

  update(fn: Prism.Updater<V>): (t:T) => T;
  update(t:T, fn: Prism.Updater<V>): T;

  comp<V2>(l: Prism.Prismish<V, V2>): Prism<T, V2>;
}

/** A mapping to/from one type to another. Used with the `map` function to create a lens that operates on one type via another. */
export type Isomorphism<T, V> = {
  to: (t: T) => V;
  from: (v: V) => T;
};

/** Core module for creating and using prisms, which are get/set proxies that gracefully handle undefined. */
export namespace Prism {
  class _None {}
  export type NONE = _None;
  export const NONE: NONE = new _None();

  export const isNone = <V>(v: V | NONE): v is NONE => v === NONE;
  export const isNotNone = <V>(v: V | NONE): v is V => v !== NONE;

  export type Updater<V> = (v: V | Prism.NONE) => V | Prism.NONE;

  export function of<T, V>(spec: IPrism<T, V>): Prism<T, V> {
    const func = (o => spec.get(o)) as Prism<T, V>;

    function set(v: V): (t: T) => T;
    function set(t: T, v: V): T;
    function set(tOrV: T | V, v?: V) {
      if (arguments.length === 1)
        return (t:T) => spec.set(t, tOrV as V);

      return spec.set(tOrV as T, v as V);
    }

    function update(fn: Prism.Updater<V>): (t:T) => T;
    function update(t:T, fn: Prism.Updater<V>): T;
    function update(tOrFn: T | Prism.Updater<V>, fn?: Prism.Updater<V>) {
      if (arguments.length === 1)
        return (t:T) => func.update(t, tOrFn as Prism.Updater<V>);

      const t = tOrFn as T;
      let v = spec.get(t);
      if (isNone(v))
        return t;

      v = (fn as Prism.Updater<V>)(v);
      return isNotNone(v) ? spec.set(t, v) : t;
    }

    const comp = Prism.comp.bind(undefined, func);

    func.get = spec.get;
    func.set = set;
    func.update = update;
    func.comp = comp;
    return func;
  }

  export type Prismish<T, U> = IPrism<T, U> | ILens<T, U>;

  export function comp<T, U, V>(l1: Prismish<T, U>, l2: Prismish<U, V>): Prism<T, V>;
  export function comp<T, U1, U2, V>(l1: Prismish<T, U1>, l2: Prismish<U1, U2>, l3: IPrism<U2, V>): Prism<T, V>;
  export function comp<T, U1, U2, U3, V>(l1: Prismish<T, U1>, l2: Prismish<U1, U2>, l3: IPrism<U2, U3>, l4: Prismish<U3, V>): Prism<T, V>;
  export function comp<T, U1, U2, U3, U4, V>(l1: Prismish<T, U1>, l2: Prismish<U1, U2>, l3: IPrism<U2, U3>, l4: Prismish<U3, U4>, l5: Prismish<U4, V>): Prism<T, V>;
  export function comp<T, V>(...prisms: Prismish<any, any>[]): Prism<T, V> {
    let performComposedSet: any;
    return Prism.of<T, V>({
      get: t =>
        prisms.reduce((prevT, p) => isNone(prevT) ? Prism.NONE : p.get(prevT), t),
      set: (t, v) => {
        if (performComposedSet === undefined) {
          performComposedSet = makeComposedSetter();
        }
        return performComposedSet(t, v, prisms, 0);
      }
    });
  }
}

/** Core module for dealing with lenses. Lenses are objects that make it easy to get and update nested structure in a composable, functional way. */
export namespace Lens {
  /** Returns a builder which can be used to create a lens that updates a simple object value or nested value */
  export function from<T>() {
    return new LensFactory<T>();
  }

  /** Creates a Lens from a simple get/set specification. */
  export function of<T,V>(spec: ILens<T,V>): Lens<T,V> {
    return (Prism.of as any)(spec);
  }

  /** Given a lens and a way to map that lens type to/from another (an isomorphism), returns a lens that can operate on the other type. */
  export function map<T, U, V>(l: ILens<T, U>, f: Isomorphism<U, V>): Lens<T, V> {
    return Lens.of({
      get: (o: T) => f.to(l.get(o)),
      set: (o, v) => l.set(o, f.from(v))
    });
  }

  /** Compose together lenses for updating nested structures. */
  export function comp<T, U, V>(l1: ILens<T, U>, l2: ILens<U, V>): Lens<T, V>;
  /** Compose together lenses for updating nested structures. */
  export function comp<T, U1, U2, V>(l1: ILens<T, U1>, l2: ILens<U1, U2>, l3: ILens<U2, V>): Lens<T, V>;
  /** Compose together lenses for updating nested structures. */
  export function comp<T, U1, U2, U3, V>(l1: ILens<T, U1>, l2: ILens<U1, U2>, l3: ILens<U2, U3>, l4: ILens<U3, V>): Lens<T, V>;
  /** Compose together lenses for updating nested structures. */
  export function comp<T, U1, U2, U3, U4, V>(l1: ILens<T, U1>, l2: ILens<U1, U2>, l3: ILens<U2, U3>, l4: ILens<U3, U4>, l5: ILens<U4, V>): Lens<T, V>;
  /** Compose together lenses for updating nested structures. */
  export function comp(...lenses: ILens<any, any>[]): Lens<any, any> {
    return Prism.comp.apply(undefined, lenses);
  }
}

export interface SafeUpdate {
  <O, K1 extends keyof O>(o: O, k: K1, v: O[K1]): O;
  <O, K1 extends keyof O,
      K2 extends keyof O[K1]>(o: O, k: K1, k2: K2, v: O[K1][K2]): O;
  <O, K1 extends keyof O,
      K2 extends keyof O[K1],
      K3 extends keyof O[K1][K2]>(o: O, k: K1, k2: K2, k3: K3, v: O[K1][K2][K3]): O;
  <O, K1 extends keyof O,
      K2 extends keyof O[K1],
      K3 extends keyof O[K1][K2],
      K4 extends keyof O[K1][K2][K3]>(o: O, k: K1, k2: K2, k3: K3, k4: K4, v: O[K1][K2][K3][K4]): O;
  <O, K1 extends keyof O,
      K2 extends keyof O[K1],
      K3 extends keyof O[K1][K2],
      K4 extends keyof O[K1][K2][K3],
      K5 extends keyof O[K1][K2][K3][K4]>(o: O, k: K1, k2: K2, k3: K3, k4: K4, k5: K5, v: O[K1][K2][K3][K4][K5]): O;
}

/** Factory to create monomorphic composed setters */
function makeComposedSetter() {
  const performComposedSet = (o: any, v: any, prisms: Prism.Prismish<any, any>[], index: number): any => {
    if (index == prisms.length - 1) {
      return prisms[index].set(o, v);
    } else {
      const inner = prisms[index].get(o);
      if (Prism.isNotNone(inner)) {
        return prisms[index].set(o, performComposedSet(inner, v, prisms, index + 1));
      } else {
        return o;
      }
    }
  };
  return performComposedSet;
}

/** Factory to create monomorphic updaters */
function makeUpdater() {
  const performUpdate = (o: any, v: any, keys: string[], idx: number, last: number) => {
    const copy = {...o};
    if (idx == last) {
      copy[keys[idx]] = v;
      return copy;
    } else {
      copy[keys[idx]] = performUpdate(o[keys[idx]], v, keys, idx+1, last);
      return copy;
    }
  }
  return performUpdate;
}

export class LensFactory<O> {
  /** Creates lenses that access/update substructure via a keypath. */
  prop<K extends keyof O>(k: K): Lens<O, O[K]>;
  /** Creates lenses that access/update substructure via a keypath. */
  prop<K extends keyof O, K2 extends keyof O[K]>(k: K, k2: K2): Lens<O, O[K][K2]>;
  /** Creates lenses that access/update substructure via a keypath. */
  prop<K extends keyof O,
    K2 extends keyof O[K],
    K3 extends keyof O[K][K2]>(k: K, k2: K2, k3: K3): Lens<O, O[K][K2][K3]>;
  /** Creates lenses that access/update substructure via a keypath. */
  prop<K extends keyof O,
    K2 extends keyof O[K],
    K3 extends keyof O[K][K2],
    K4 extends keyof O[K][K2][K3]>(k: K, k2: K2, k3: K3, k4: K4): Lens<O, O[K][K2][K3][K4]>;
  prop(...ks: string[]): Lens<any, any> {
    let performUpdate: any;
    return Lens.of({
      get(o: O) {
        return ks.reduce((x, k) => (x as any)[k], o);
      },
      set(o: O, v: any) {
        if (performUpdate === undefined) {
          performUpdate = makeUpdater();
        }
        return performUpdate(o, v, ks, 0, ks.length - 1);
      }
    });
  }
}
