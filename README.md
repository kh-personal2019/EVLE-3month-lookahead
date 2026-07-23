# EVLE Phase II - August 2026 Calendar Website

This is a static website package generated from the August section of `AE 0179-19 Task 01.02 3-Month Lookahead.docx`.

## Files

```text
index.html
styles.css
script.js
data/events.json
```

## How to run locally

Run a local web server from this folder, then open the served `index.html`.

```bash
python3 -m http.server 8000
```

Then browse to your local server page.

## Editing events

Edit `data/events.json`. Each event has:

```json
{
  "date": "2026-08-03",
  "category": "SnoCo",
  "title": "SnoCo coordination",
  "details": ["..."]
}
```

The site automatically renders all events in August 2026.
