import { Prism } from './index';
export declare namespace Arrays {
    /** Returns a Prism for the specified array index */
    function index<T>(n: number): Prism<T[], T>;
    /** Like Array#splice but returns a copy */
    function splice<T>(a: T[], i: number, del: number, ...add: T[]): T[];
    /** Like Array#pop but returns a copy */
    function pop<T>(a: T[]): T[];
    /** Like Array#push but returns a copy */
    function push<T>(a: T[], t: T): T[];
    /** Like Array#unshift but returns a copy */
    function unshift<T>(a: T[], t: T): T[];
    /** Like Array#shift but returns a copy */
    function shift<T>(a: T[]): T[];
}
