/**
 * QR code (ISO/IEC 18004): byte mode, error correction level M, versions 1 to 10, which holds a
 * 213-byte address. Returns the modules as one SVG path, or null when the text is too long.
 * Checked by decoding every address on the site with Apple's Vision (scripts are not shipped).
 */

// [error-correction codewords per block, blocks, data codewords in each, blocks that hold one more]
const BLOCKS: [number, number, number, number][] = [
  [10, 1, 16, 0], [16, 1, 28, 0], [26, 1, 44, 0], [18, 2, 32, 0], [24, 2, 43, 0],
  [16, 4, 27, 0], [18, 4, 31, 0], [22, 2, 38, 2], [22, 3, 36, 2], [26, 4, 43, 1],
];
const ALIGN = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = EXP[i + 255] = x;
  LOG[x] = i;
  x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);
}
const mul = (a: number, b: number) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

/** Reed-Solomon remainder of `data` for `n` error-correction codewords. */
function remainder(data: number[], n: number): number[] {
  let gen = [1];
  for (let i = 0; i < n; i++) gen = gen.map((g, j) => mul(g, EXP[i]) ^ (gen[j - 1] ?? 0)).concat(gen[gen.length - 1]);
  // highest power first, without its leading 1
  const poly = gen.reverse().slice(1);
  const rem = new Array<number>(n).fill(0);
  for (const byte of data) {
    const factor = byte ^ (rem.shift() ?? 0);
    rem.push(0);
    poly.forEach((g, i) => (rem[i] ^= mul(g, factor)));
  }
  return rem;
}

const MASKS: ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

/** The standard's four penalties: a reader copes best with the mask that scores lowest. */
function penalty(m: boolean[][]): number {
  const n = m.length;
  let score = 0;
  let dark = 0;
  const lines = [...m.map((row) => row), ...m.map((_, c) => m.map((row) => row[c]))];
  for (const line of lines) {
    let run = 1;
    for (let i = 1; i <= n; i++) {
      if (i < n && line[i] === line[i - 1]) run++;
      else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    const text = line.map((d) => (d ? 1 : 0)).join('');
    for (const pattern of ['10111010000', '00001011101']) for (let at = text.indexOf(pattern); at >= 0; at = text.indexOf(pattern, at + 1)) score += 40;
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (m[r][c]) dark++;
      if (r && c && m[r][c] === m[r - 1][c] && m[r][c] === m[r][c - 1] && m[r][c] === m[r - 1][c - 1]) score += 3;
    }
  }
  return score + Math.floor(Math.abs((dark * 20) / (n * n) - 10)) * 10;
}

export function qr(text: string): boolean[][] | null {
  const bytes = [...new TextEncoder().encode(text)];
  let version = 1;
  let capacity = 0;
  for (; version <= 10; version++) {
    const [, blocks, each, more] = BLOCKS[version - 1];
    capacity = blocks * each + more * (each + 1);
    if (Math.ceil((4 + (version < 10 ? 8 : 16) + bytes.length * 8) / 8) <= capacity) break;
  }
  if (version > 10) return null;

  // mode, length, the bytes, a terminator, then padding to the version's capacity
  const bits: number[] = [];
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };
  push(4, 4);
  push(bytes.length, version < 10 ? 8 : 16);
  bytes.forEach((b) => push(b, 8));
  push(0, Math.min(4, capacity * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((v, b) => (v << 1) | b, 0));
  for (let pad = 0xec; data.length < capacity; pad ^= 0xec ^ 0x11) data.push(pad);

  // split into blocks, each with its own error correction, then interleave both
  const [ecLength, blocks, each, more] = BLOCKS[version - 1];
  const parts: number[][] = [];
  for (let b = 0, at = 0; b < blocks + more; b++) {
    const length = each + (b >= blocks ? 1 : 0);
    parts.push(data.slice(at, at + length));
    at += length;
  }
  const corrections = parts.map((part) => remainder(part, ecLength));
  const stream: number[] = [];
  for (let i = 0; i <= each; i++) parts.forEach((part) => i < part.length && stream.push(part[i]));
  for (let i = 0; i < ecLength; i++) corrections.forEach((ec) => stream.push(ec[i]));

  const n = 17 + 4 * version;
  const m = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const fixed = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const set = (r: number, c: number, dark: boolean) => {
    m[r][c] = dark;
    fixed[r][c] = true;
  };
  for (let i = 0; i < n; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  // finders with their light border
  for (const [r0, c0] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if (r0 + r < 0 || c0 + c < 0 || r0 + r >= n || c0 + c >= n) continue;
        const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
        set(r0 + r, c0 + c, ring !== 2 && ring !== 4);
      }
    }
  }
  const centres = ALIGN[version - 1];
  centres.forEach((r, i) =>
    centres.forEach((c, j) => {
      const last = centres.length - 1;
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
    }),
  );
  /** Format: the error-correction level (M is 0) and the mask, protected by a BCH code. */
  const format = (mask: number) => {
    let rem = mask;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const word = ((mask << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((word >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) set(i, 8, bit(i));
    set(7, 8, bit(6));
    set(8, 8, bit(7));
    set(8, 7, bit(8));
    for (let i = 9; i < 15; i++) set(8, 14 - i, bit(i));
    for (let i = 0; i < 8; i++) set(8, n - 1 - i, bit(i));
    for (let i = 8; i < 15; i++) set(n - 15 + i, 8, bit(i));
    set(n - 8, 8, true);
  };
  format(0);
  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const word = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = ((word >>> i) & 1) === 1;
      set(Math.floor(i / 3), n - 11 + (i % 3), dark);
      set(n - 11 + (i % 3), Math.floor(i / 3), dark);
    }
  }

  // the stream runs up and down in two-module columns from the bottom right, skipping the fixed modules
  let at = 0;
  for (let col = n - 1, row = n - 1, step = -1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (; row >= 0 && row < n; row += step) {
      for (const c of [col, col - 1]) {
        if (fixed[row][c]) continue;
        m[row][c] = at < stream.length * 8 && ((stream[at >> 3] >> (7 - (at & 7))) & 1) === 1;
        at++;
      }
    }
    step = -step;
    row += step;
  }

  let best: boolean[][] = m;
  let lowest = Infinity;
  MASKS.forEach((mask, k) => {
    format(k);
    const tried = m.map((row, r) => row.map((dark, c) => (fixed[r][c] ? dark : dark !== mask(r, c))));
    const score = penalty(tried);
    if (score < lowest) {
      lowest = score;
      best = tried;
    }
  });
  return best;
}

/** The code as one SVG path in module units (draw it in a viewBox of `size` with a quiet border). */
export function qrPath(text: string): { d: string; size: number } | null {
  const m = qr(text);
  if (!m) return null;
  let d = '';
  m.forEach((row, r) => row.forEach((dark, c) => dark && (d += `M${c} ${r}h1v1h-1z`)));
  return { d, size: m.length };
}
