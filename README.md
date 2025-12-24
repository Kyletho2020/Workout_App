# AI-Powered Workout Tracker

A mobile-inspired workout tracker interface with recovery, targets, logs, and workout screens.

## Setup

### 1. Add your ChatGPT API key
Open `app.js` and set your API key in the placeholder when you wire up the API call:

```javascript
const OPENAI_API_KEY = 'YOUR_CHATGPT_API_KEY';
```

### 2. Run locally
```bash
# Optional: run a local server
python -m http.server 8000
```

Then open `http://localhost:8000`.

## ChatGPT API Example
Use the OpenAI Chat Completions endpoint to generate workouts:

```javascript
const OPENAI_API_KEY = 'YOUR_CHATGPT_API_KEY';

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Return only JSON.' },
      { role: 'user', content: 'Create a full-body workout with 6 exercises.' }
    ]
  })
});

const data = await response.json();
const workout = JSON.parse(data.choices[0].message.content);
console.log(workout);
```

## UI Notes
- Bottom navigation switches between the primary screens.
- The layout and colors match the reference mobile UI in the screenshots.
- All UI in this repo is static HTML/CSS/JS and ready to integrate with live data.
