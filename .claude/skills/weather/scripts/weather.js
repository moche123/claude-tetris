#!/usr/bin/env node
// Fetch current weather for a city (or current IP location if no city given).
// Uses Open-Meteo (no API key required).

const WMO = {
  0: "Despejado", 1: "Mayormente despejado", 2: "Parcialmente nublado", 3: "Nublado",
  45: "Neblina", 48: "Neblina con escarcha",
  51: "Llovizna ligera", 53: "Llovizna moderada", 55: "Llovizna intensa",
  56: "Llovizna helada ligera", 57: "Llovizna helada intensa",
  61: "Lluvia ligera", 63: "Lluvia moderada", 65: "Lluvia intensa",
  66: "Lluvia helada ligera", 67: "Lluvia helada intensa",
  71: "Nieve ligera", 73: "Nieve moderada", 75: "Nieve intensa", 77: "Granos de nieve",
  80: "Chubascos ligeros", 81: "Chubascos moderados", 82: "Chubascos violentos",
  85: "Chubascos de nieve ligeros", 86: "Chubascos de nieve intensos",
  95: "Tormenta", 96: "Tormenta con granizo ligero", 99: "Tormenta con granizo intenso",
};

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function resolveLocation(city) {
  const geo = await getJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`
  );
  const r = geo.results && geo.results[0];
  if (!r) throw new Error(`Ciudad no encontrada: ${city}`);
  return {
    label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    lat: r.latitude,
    lon: r.longitude,
  };
}

const DEFAULT_CITY = "Chiclayo, Peru";

async function main() {
  const city = process.argv.slice(2).join(" ").trim() || DEFAULT_CITY;
  const loc = await resolveLocation(city);

  const params = new URLSearchParams({
    latitude: loc.lat,
    longitude: loc.lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    timezone: "auto",
  });
  const data = await getJson(`https://api.open-meteo.com/v1/forecast?${params}`);
  const c = data.current;
  const desc = WMO[c.weather_code] ?? `Código ${c.weather_code}`;

  console.log(`Clima en ${loc.label}`);
  console.log(`Condición: ${desc}`);
  console.log(`Temperatura: ${c.temperature_2m}°C (sensación ${c.apparent_temperature}°C)`);
  console.log(`Humedad: ${c.relative_humidity_2m}%`);
  console.log(`Viento: ${c.wind_speed_10m} km/h`);
  console.log(`Precipitación: ${c.precipitation} mm`);
  console.log(`Actualizado: ${c.time} (zona ${data.timezone})`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
