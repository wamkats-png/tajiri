import Anthropic from '@anthropic-ai/sdk'

let _client = null
function getClient() {
  if (!_client) {
    _client = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_KEY || 'missing-key',
      dangerouslyAllowBrowser: true,
    })
  }
  return _client
}

const SYSTEM_PROMPT = `You are an assistant for a Ugandan landlord property management app.
Parse the user's natural language input and return ONLY a JSON object — no explanation, no markdown.

Possible intents and their JSON shapes:

1. add_property
   { "intent": "add_property", "name": string, "address": string|null }

2. add_unit
   { "intent": "add_unit", "property_name": string, "unit_name": string }

3. add_tenant
   { "intent": "add_tenant", "name": string, "phone": string|null, "national_id": string|null }

4. assign_tenant
   { "intent": "assign_tenant", "tenant_name": string, "unit_name": string, "property_name": string, "start_date": string (ISO date), "monthly_rent_ugx": number }

5. record_payment
   { "intent": "record_payment", "tenant_name": string, "amount_ugx": number, "month": number (1-12), "year": number, "method": "cash"|"mtn"|"airtel"|"bank"|null, "notes": string|null }

6. query
   { "intent": "query", "question": string }

7. unknown
   { "intent": "unknown", "message": string }

Rules:
- Amounts like "450k", "450,000", "450000" all mean 450000 UGX.
- Month names like "March", "Feb" should be converted to numbers.
- If the current year is not mentioned, assume ${new Date().getFullYear()}.
- If you cannot determine the intent, use "unknown".
- Return ONLY the JSON object. No text before or after.`

/**
 * Parse a natural language landlord command into a structured intent object.
 * @param {string} input
 * @returns {Promise<object>}
 */
export async function parseIntent(input) {
  const res = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: input }],
  })

  const raw = res.content[0].text.trim()
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    return JSON.parse(text)
  } catch {
    return { intent: 'unknown', message: 'Could not parse response: ' + raw }
  }
}

/**
 * Extract tenant info from a National ID photo using Claude Vision.
 * @param {string} base64Image  - base64 encoded image (no data URI prefix)
 * @param {string} mimeType     - e.g. "image/jpeg"
 * @returns {Promise<{full_name:string|null, national_id_number:string|null, date_of_birth:string|null}>}
 */
export async function extractFromNationalID(base64Image, mimeType = 'image/jpeg') {
  const res = await getClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: 'This is a Uganda National ID card. Extract the following fields and return ONLY a JSON object with keys: full_name, national_id_number, date_of_birth (as ISO date string YYYY-MM-DD or null). If a field is unreadable, set it to null. No markdown, no explanation.',
          },
        ],
      },
    ],
  })

  const raw = res.content[0].text.trim()
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    return JSON.parse(text)
  } catch {
    return { full_name: null, national_id_number: null, date_of_birth: null }
  }
}
