require('dotenv').config({ path: './server/.env' })
const { validateItineraryInput, buildSystemPrompt } = require('./server/routes/planner')
// oh wait, planner.js exports the router, not the functions.
