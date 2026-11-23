// One Emoji, One Smile — make.fun (u-0xkianno-one-emoji-one-smile-5470751f).
// Node 22, standard library only, no network, no randomness.
// Deterministic: one fixed emoji is written to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR/entry.txt outside the grader container),
// so two runs produce byte-identical output.
//
// The emoji: 🫂  (U+1FA82 PEOPLE HUGGING — two people embracing).
//
// FIELD STUDY (50 entry titles visible of 809 in the field):
//   Saturated — avoid: 🤗 hugging face (7+ titles, the field's #1 pick),
//   🌻 sunflower, 🥰 smiling face with hearts, 🫶 heart hands, 💛 yellow
//   heart, 😄 grinning face, 🥹 face holding back tears, 😇 smiling face
//   with halo, 🌞 sun with a face. None of the 50 titles is a hug between
//   two people: 🫂 is absent from the visible field.
//
// Why 🫂, against the judge's brief (most important first):
//   1. It plainly aims to warm a stranger: a literal embrace is the most
//      direct warmth gesture there is — it beats a face that merely
//      smiles, and the brief says an entry loses to any emoji that
//      plainly aims to warm a stranger.
//   2. Warmth at first glance: two figures embracing reads as care and
//      kindness instantly, with no context needed.
//   3. Universality: a hug is read the same way by a stranger of any age
//      or background — no irony, no in-joke, nothing that lands wrong.
//   4. Chosen rather than default: it is NOT the first smiley that comes
//      to mind (😊 / 😄 / 🙂), and it is not the field's saturated 🤗 —
//      it feels picked for the moment, while staying instantly readable.
//   5. Right for a stranger: the embrace is platonic — two people
//      holding each other in comfort, not romance, flirtation or
//      sarcasm — so nothing in it reads oddly coming from someone unknown.
//
// REVISION ROUNDS (judged on the brief's ordered criteria):
//   Round 1 — shortlist: 🫂 people hugging, 🥲 smiling face with tear,
//     🌈 rainbow, 🤲 palms up together, 💐 bouquet.
//   Round 2 — 🥲 cut: bittersweet, not plainly warm (loses criterion 1
//     to any plainly warm emoji). 🌈 cut: cheerful but decorative, not a
//     warmth gesture (loses criteria 1–2 to a hug). 🤲 cut: reads as
//     asking/helping, not as making someone smile. 💐 cut: a kind gift,
//     but weaker than an embrace on criteria 1–2, which decide first.
//   Round 3 — 🫂 kept over 🤗: same hug idea, but 🤗 is the field's most
//     common pick (criterion 4 penalises the default) while 🫂 is absent
//     from the field and shows two people actually embracing — warmer at
//     first glance, and still platonic under criterion 5.
//
// Local check:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//   cat out/entry.txt   # -> 🫂

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// The one emoji most likely to make a stranger smile.
//
// Named constant (not an inline literal) so the entry emoji is a single,
// reviewable decision: changing the emoji means changing this one line,
// and the validation below guards it before anything is written.
const ENTRY_EMOJI = '🫂';

// The competition's gate: /output/entry.txt must be UTF-8 text of
// 1 to 8 characters, not only whitespace, and the entry must be exactly
// one emoji. Validate before writing and fail loudly (non-zero exit +
// a message on stderr) instead of writing an invalid entry.
function validateEmoji(emoji: unknown): asserts emoji is string {
  if (typeof emoji !== 'string') {
    failValidation(`entry emoji is not a string: ${typeof emoji}`);
  }
  const chars = [...emoji];
  if (chars.length !== 1) {
    failValidation(
      `entry must be exactly one emoji (one code point), got ${chars.length} characters: ${JSON.stringify(emoji)}`,
    );
  }
  if (!emoji.trim()) {
    failValidation('entry emoji must not be whitespace');
  }
  // Strict single-emoji shape: exactly one code point, and it must be
  // an emoji, not a letter, digit or punctuation mark — a stray
  // character would make the entry read as a trick, not a smile.
  // 🫂 is U+1FA82, inside the emoji blocks (>= U+1F000); a lone
  // accented letter such as 'é' (U+00E9) is not an emoji and is refused.
  const cp = emoji.codePointAt(0)!;
  if (cp < 0x1f000) {
    failValidation(
      `entry must be a single emoji (code point >= U+1F000), got U+${cp.toString(16).toUpperCase()}: ${JSON.stringify(emoji)}`,
    );
  }
}

// Fail hard: one clear message on stderr, then exit 1. Never write a
// file when the emoji does not pass validation.
function failValidation(message: string): never {
  console.error(`error: invalid entry emoji — ${message}`);
  process.exit(1);
}

// Where the entry goes. Precedence:
//   1. $MAKEFUN_OUTPUT_DIR — the grader's output directory.
//   2. $MAKEFUN_BOT_DIR/output — the bot's working directory, when the
//      output directory itself was not given.
//   3. /output — the grader container's default.
// An empty (or whitespace-only) variable counts as unset: the old code
// used `??`, so an empty MAKEFUN_OUTPUT_DIR was passed straight to
// mkdirSync and crashed. Values are resolved to absolute paths so the
// write target is unambiguous whatever the working directory is.
function resolveOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR?.trim();
  if (fromEnv) {
    return resolve(fromEnv);
  }
  const botDir = process.env.MAKEFUN_BOT_DIR?.trim();
  if (botDir) {
    return resolve(botDir, 'output');
  }
  return '/output';
}

validateEmoji(ENTRY_EMOJI);

const outDir = resolveOutputDir();
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'entry.txt');
writeFileSync(outPath, ENTRY_EMOJI, 'utf-8');

// Round-trip check: what the grader reads must be byte-identical to the
// chosen emoji. If the write were ever truncated or re-encoded, fail
// loudly instead of shipping a broken entry.
if (readFileSync(outPath, 'utf-8') !== ENTRY_EMOJI) {
  console.error('error: entry.txt round-trip mismatch — refusing to exit 0');
  process.exit(1);
}
