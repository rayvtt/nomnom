// NomNom Log — AI parser endpoint (Cloudflare Pages Function).
//
//   POST /api/parse   { text?, image?: {media_type, data(base64)}, lang, local_time }
//   GET  /api/parse   → { configured: boolean, access_code_required: boolean }
//
// Turns a spoken/typed log ("Okay, I just had bún bò for lunch") or a photo
// (supplement bottle, med box, plate of food) into structured nutrition items.
//
// Configure in Cloudflare Pages → Settings → Environment variables:
//   ANTHROPIC_API_KEY   (required, mark as secret)
//   NOMNOM_ACCESS_CODE  (optional; if set, clients must send x-nomnom-code)
//   NOMNOM_MODEL        (optional; default claude-haiku-5-5 — cheapest; e.g. claude-sonnet-5-5 for more accuracy)
//   NOMNOM_EFFORT       (optional; low | medium | high — default low for snappy logging)
//
// Raw fetch instead of the Anthropic SDK because this repo has no npm/bundler
// step (see CLAUDE.md "No npm, no bundler").

import { NUTRIENT_KEYS, referenceTable } from '../../log/vn-foods.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_IMAGE_B64 = 6_000_000;   // ~4.5 MB decoded; client resizes to ≤1568 px first
const MAX_TEXT = 2000;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const nutrientSchema = {
  type: 'object',
  additionalProperties: false,
  required: NUTRIENT_KEYS,
  properties: Object.fromEntries(NUTRIENT_KEYS.map(k => [k, { type: 'number' }])),
};

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reply', 'items'],
  properties: {
    reply: { type: 'string', description: 'One short, friendly confirmation sentence in the user language.' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'name', 'name_vi', 'brand', 'serving', 'servings', 'confidence', 'assumptions', 'reminder_time', 'nutrients'],
        properties: {
          kind: { type: 'string', enum: ['food', 'drink', 'supplement', 'medication'] },
          name: { type: 'string', description: 'Display name in the user language.' },
          name_vi: { type: 'string', description: 'Vietnamese name with full diacritics, or same as name if not Vietnamese.' },
          brand: { type: 'string', description: 'Brand for packaged products/supplements/meds, else empty string.' },
          serving: { type: 'string', description: 'What ONE serving is, e.g. "1 bowl (~650 g)" or "1 softgel".' },
          servings: { type: 'number', description: 'How many servings were consumed.' },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
          assumptions: { type: 'string', description: 'Brief note on portion/recipe assumptions or label details not captured.' },
          reminder_time: { type: 'string', description: 'HH:MM 24h if the user asked for / implied a daily reminder, else empty string.' },
          nutrients: nutrientSchema,
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `You are the parser inside NomNom Log, a Vietnamese-first nutrition journal. The user taps a button and speaks, types, or sends a photo describing something they just ate, drank, or took (supplement or medication). Turn it into structured log items.

How to parse:
- Create one item per distinct thing consumed. "bún bò and an iced coffee" is two items. Ignore filler ("okay", "um", "for lunch").
- Speech-to-text often drops Vietnamese diacritics or mangles words ("boon bo way" → bún bò Huế, "fuh" → phở). Infer the most likely dish.
- nutrients are for ONE serving; servings is how many were consumed (e.g. "two bowls" → 2, "half" → 0.5). Default servings = 1.
- Use typical Vietnamese street-vendor or home portions unless the user states otherwise. Adjust for modifiers they mention (large/đặc biệt bowl, extra meat, no sugar, ít đường, less rice).
- When the dish matches the NomNom reference table below, start from those values and adjust for stated modifiers. Otherwise estimate from standard food-composition data. Be realistic about sodium in broths, fish sauce and dipping sauces, and sugar in Vietnamese drinks and chè.
- Every nutrient key must be present; use 0 when there is none. Units are in the key names (mg, mcg, g, ml). water_ml counts the liquid in drinks and soups.
- Only log things the user consumed or is consuming now. If the message is a question, a plan, or not loggable, return an empty items array and use reply to say so briefly.

Photos:
- Supplement bottle / box: read the Supplement Facts panel. Use per-serving label amounts. Convert IU: vitamin D 40 IU = 1 mcg; vitamin A as mcg RAE (retinol 3.33 IU = 1 mcg, beta-carotene 20 IU = 1 mcg); vitamin E 1 mg ≈ 1.49 IU (natural) or 2.22 IU (synthetic). Folate as mcg DFE (folic acid × 1.7). Put brand and product name in brand/name. Put notable ingredients outside the schema (omega-3 EPA/DHA, probiotics, herbs) in assumptions. If the label is unreadable, say so and set confidence low.
- Medication: kind "medication", identify name and strength from the packaging, all nutrients 0. Do not give medical or dosing advice.
- Food photo: identify the dish and portion visually; confidence reflects how clearly you can see it.
- If the user's text accompanies the photo (e.g. "took 2 of these"), apply it.

reminder_time: only for supplements/medications when the user mentions a time or schedule ("every morning" → 08:00, "before bed" → 22:00, "at 9pm" → 21:00). Otherwise "".

Language: write name, serving, assumptions and reply in the user's language (vi = Vietnamese, en = English). name_vi is always Vietnamese with diacritics.

NomNom reference table (per one serving; columns in nutrient-key order):
${referenceTable()}`;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export async function onRequestGet({ env }) {
  return json({ configured: Boolean(env.ANTHROPIC_API_KEY), access_code_required: Boolean(env.NOMNOM_ACCESS_CODE) });
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 503);
  if (env.NOMNOM_ACCESS_CODE && request.headers.get('x-nomnom-code') !== env.NOMNOM_ACCESS_CODE) {
    return json({ error: 'bad_access_code' }, 401);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }

  const text = typeof body.text === 'string' ? body.text.trim().slice(0, MAX_TEXT) : '';
  const lang = body.lang === 'en' ? 'en' : 'vi';
  const localTime = typeof body.local_time === 'string' ? body.local_time.slice(0, 40) : '';
  const image = body.image;

  if (!text && !image) return json({ error: 'empty' }, 400);
  if (image && (!IMAGE_TYPES.includes(image.media_type) || typeof image.data !== 'string' || image.data.length > MAX_IMAGE_B64)) {
    return json({ error: 'bad_image' }, 400);
  }

  const content = [];
  if (image) content.push({ type: 'image', source: { type: 'base64', media_type: image.media_type, data: image.data } });
  content.push({
    type: 'text',
    text: `User language: ${lang}\nUser local time: ${localTime || 'unknown'}\n` +
      (text ? `User said: """${text}"""` : 'No text — parse the photo.'),
  });

  const model = env.NOMNOM_MODEL || 'claude-haiku-5-5';
  // Server-side refusal fallback exists for Opus/Sonnet/Fable, not Haiku.
  const useFallback = !model.startsWith('claude-haiku');
  const effort = ['low', 'medium', 'high'].includes(env.NOMNOM_EFFORT) ? env.NOMNOM_EFFORT : 'low';

  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2026-10-21',
        // Server-side refusal fallback: if a safety classifier declines, the
        // API re-runs the request on Anthropic's recommended fallback model.
        ...(useFallback ? { 'anthropic-beta': 'server-side-fallback-2026-07-01' } : {}),
      },
      body: JSON.stringify({
        model,
        max_tokens: 16000,
        ...(useFallback ? { fallbacks: 'default' } : {}),
        output_config: { effort, format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content }],
      }),
    });
  } catch (err) {
    return json({ error: 'upstream_unreachable' }, 502);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('anthropic error', res.status, detail.slice(0, 500));
    return json({ error: res.status === 429 ? 'rate_limited' : 'upstream_error', status: res.status }, res.status === 429 ? 429 : 502);
  }

  const msg = await res.json();
  if (msg.stop_reason === 'refusal') return json({ error: 'refusal' }, 422);
  if (msg.stop_reason === 'max_tokens') return json({ error: 'truncated' }, 502);

  const textBlock = (msg.content || []).find(b => b.type === 'text');
  if (!textBlock) return json({ error: 'no_output' }, 502);

  let parsed;
  try { parsed = JSON.parse(textBlock.text); } catch { return json({ error: 'bad_output' }, 502); }

  return json({ reply: parsed.reply, items: parsed.items || [], model: msg.model, source: 'ai' });
}
