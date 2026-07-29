---
name: weather
description: Get current weather for a city, defaulting to Chiclayo, Peru if no city is given. Use when the user asks about weather, temperature, or forecast.
---

# Weather

Runs `scripts/weather.js` (Node, no dependencies, no API key) to fetch current
conditions from Open-Meteo.

## Usage

```bash
node .claude/skills/weather/scripts/weather.js [city]
```

- With a city name: geocodes it via Open-Meteo's geocoding API, then fetches
  current weather for that location.
- With no argument: defaults to "Chiclayo, Peru".

Run the script with Bash and relay its stdout to the user. On failure it
prints `Erro: <reason>` to stderr and exits non-zero — surface that message
as-is.
