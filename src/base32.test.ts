import { beforeEach, describe, it } from 'node:test';
import * as Assert from 'node:assert/strict';

import { encode, decode, encodeIterable, decodeIterable , encodeAsyncIterable, decodeAsyncIterable } from './base32.ts';

describe('iterators', ()=>{
    const original = Buffer.from('hallo philipp wie geht es dir');
    let encoded: string | undefined;
    describe('plain', ()=>{
        it('can encode', ()=>{
            encoded = encode(original);
            Assert.ok(encoded);
        });
        it('can decode', ()=>{
            const decoded = decode(encoded ?? '');
            Assert.ok(decoded.length);
            Assert.equal(decoded.toHex(), original.toHex());
        });
    });
    describe('Iterable', ()=>{
        it('encode', ()=>{
            encoded = [...encodeIterable([original])].join('');
            Assert.ok(encoded);
            Assert.equal(decode(encoded).toHex(), original.toHex());
        });
        it('decode', ()=>{
            const decoded = Buffer.concat([ ...decodeIterable([encoded ?? '']) ]);
            Assert.ok(decoded.length);
            Assert.equal(decoded.toHex(), original.toHex());
        });
    });
    describe('AsyncIterable', ()=>{
        it('encode', async ()=>{
            const iter = (async function*() { yield original; })()
            encoded = (await Array.fromAsync(encodeAsyncIterable(iter))).join('');
            Assert.ok(encoded);
            Assert.equal(decode(encoded).toHex(), original.toHex());
        });
        it('decode', async ()=>{
            Assert.ok(encoded);
            const iter = (async function*() { yield encoded; })();
            const decoded = Buffer.concat(await Array.fromAsync(decodeAsyncIterable(iter)));
            Assert.ok(decoded.length);
            Assert.equal(decoded.toHex(), original.toHex());
        });
    });
});