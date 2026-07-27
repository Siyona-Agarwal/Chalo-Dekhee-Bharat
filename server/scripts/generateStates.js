'use strict'

const fs = require('fs')
const path = require('path')
const OpenAI = require('openai')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'

if (!NVIDIA_API_KEY) {
  console.error('Missing NVIDIA_API_KEY in environment variables')
  process.exit(1)
}

const openai = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: NVIDIA_BASE_URL,
})

const STATES = [
  'Rajasthan', 'Kerala', 'Goa', 'Maharashtra', 'Tamil Nadu',
  'Uttar Pradesh', 'Gujarat', 'Karnataka', 'West Bengal', 'Assam'
]

const GENERATED_DIR = path.join(__dirname, '../../client/src/data/generated')

if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true })
}

const SCHEMA = `
{
  "id": "lowercase_state_id",
  "name": "State Name",
  "tagline": "Catchy short tagline",
  "topAttractions": [
    { "name": "...", "city": "...", "description": "..." },
    { "name": "...", "city": "...", "description": "..." },
    { "name": "...", "city": "...", "description": "..." }
  ],
  "bestTimeToVisit": "...",
  "signatureFood": ["...", "..."],
  "culturalFact": "A one-sentence verified cultural or historical fact.",
  "hiddenGem": { "name": "...", "description": "..." },
  "relatedFestival": "...",
  "passportTieIn": "If you have stamps or wishlist items for this state, they will appear here!"
}
`

async function generateState(state) {
  console.log(`Generating content for ${state}...`)
  
  const systemPrompt = `You are a travel content writer for an Indian tourism platform. Generate factual, verifiable content about ${state} following this exact JSON schema: ${SCHEMA}. Only include well-known, verifiable attractions and facts. Do not invent statistics, dates, or claims you're not confident about. If uncertain about a specific fact, choose a safer, well-documented alternative instead.`

  const userMessage = `Generate factual travel content for the Indian state of ${state}.`

  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
      stream: false
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      throw new Error('Empty response')
    }

    let jsonStr = rawContent
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim()
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim()
    }

    const data = JSON.parse(jsonStr)
    const fileName = path.join(GENERATED_DIR, `${state.toLowerCase().replace(/ /g, '_')}.json`)
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2))
    console.log(`✅ Saved ${fileName}`)
  } catch (err) {
    console.error(`❌ Failed for ${state}:`, err.message)
  }
}

async function run() {
  for (const state of STATES) {
    await generateState(state)
    // Small delay to prevent rate limits
    await new Promise(resolve => setTimeout(resolve, 1500))
  }
  console.log('Generation complete.')
}

run()
