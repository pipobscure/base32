declare global {
	interface Uint8ArrayConstructor {
		fromBase64: (base64: string) => Uint8Array;
		fromHex: (hex: string) => Uint8Array;
	}

	interface Uint8Array {
		toBase64: () => string;
		toHex: () => string;
	}
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';

export function encode(data: Uint8Array) {
    return Array.from(encodeIterable([ data ])).join('');
}
export function decode(data: string) {
    return Uint8Array.fromHex([...decodeIterable([ data ])].map(b=>b.toHex()).join(''));
}
export function *encodeIterable(chunks: Iterable<Uint8Array>) {
    let remain: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
    const buffer = new Uint8Array(5);
    for (let chunk of chunks) {
        while (chunk.length) {
            buffer.set(remain, 0);
            const piece = chunk.subarray(0, 5 - remain.length);
            buffer.set(piece, remain.length);
            const buflen = remain.length + piece.length;
            chunk = chunk.subarray(5 - remain.length);
            if (piece.length < 5) {
                remain = piece;
                continue;
            }
            remain = remain.length ? new Uint8Array(0) : remain;
            yield *toBase32(toNumber(buffer), buflen * 8)
        }
    }
    if (!remain.length) return;
    let number = toNumber(remain);
    const extra = (5 - ((remain.length * 8) % 5));
    number = number << BigInt(extra == 5 ? 0 : extra);
    yield *toBase32(number, (remain.length * 8) + extra);
}
export function *decodeIterable(parts: Iterable<string>) {
    let remain = '';
    for (let part of parts) {
        part = `${remain}${parts}`;
        remain = '';
        for (const piece of Array.from(part.match(/\w{1,8}/g) ?? [])) {
            if (piece.length < 8) {
                remain = piece;
                break;
            }
            const buffer = fromNumber(fromBase32(piece), piece.length * 5);
            yield buffer;
        }
    }
    if (!remain.length) return;
    let number = fromBase32(remain);
    const extra = ((remain.length * 5) % 8);
    number = number >> BigInt(extra);
    const buffer = fromNumber(number, (remain.length * 5) - extra);
    yield buffer;
}
export async function *encodeAsyncIterable(chunks: AsyncIterable<Uint8Array>) {
    let remain: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
    const buffer = new Uint8Array(5);
    for await (let chunk of chunks) {
        while (chunk.length) {
            buffer.set(remain, 0);
            const piece = chunk.subarray(0, 5 - remain.length);
            buffer.set(piece, remain.length);
            const buflen = remain.length + piece.length;
            chunk = chunk.subarray(5 - remain.length);
            if (piece.length < 5) {
                remain = piece;
                continue;
            }
            remain = remain.length ? new Uint8Array(0) : remain;
            yield *toBase32(toNumber(buffer), buflen * 8)
        }
    }
    if (!remain.length) return;
    let number = toNumber(remain);
    const extra = (5 - ((remain.length * 8) % 5));
    number = number << BigInt(extra == 5 ? 0 : extra);
    yield *toBase32(number, (remain.length * 8) + extra);
}
export async function *decodeAsyncIterable(parts: AsyncIterable<string>) {
    let remain = '';
    for await (let part of parts) {
        part = `${remain}${part}`;
        remain = '';
        for (const piece of Array.from(part.match(/\w{1,8}/g) ?? [])) {
            if (piece.length < 8) {
                remain = piece;
                break;
            }
            const buffer = fromNumber(fromBase32(piece), piece.length * 5);
            yield buffer;
        }
    }
    if (!remain.length) return;
    let number = fromBase32(remain);
    const extra = ((remain.length * 5) % 8);
    number = number >> BigInt(extra);
    const buffer = fromNumber(number, (remain.length * 5) - extra);
    yield buffer;
}

function toNumber(buffer: Uint8Array) {
    return BigInt(`0x${buffer.toHex()}`);
}
function fromNumber(value: bigint, size: number = 40) {
    const chars = size / 4;
    const hex = `${(new Array(chars).fill(0)).join('')}${value.toString(16)}`.slice(-1 * chars);
    return Uint8Array.fromHex(hex);
}
function *toBase32(value: bigint, size: number = 40) {
    let bits = BigInt(size);
    while (bits) {
        bits -= 5n;
        yield alphabet[Number(value >> bits) & 0x1f] ?? '=';
    }
}
function fromBase32(value: string) {
    const total = value.length * 5;
    const numbers = value.split('').map((c,i)=>{
        const bits = BigInt(alphabet.indexOf(c));
        const shl = BigInt(total - (5 * i) - 5);
        const map = bits << shl;
        return map;
    });
    return (numbers.reduce((ag,it)=>ag|it,BigInt(0)));
}
