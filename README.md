# Activity 05 — Widget Builder

> **🛠️ Stack for this lesson** — Vanilla JS / browser fetch / 4 real public APIs (wttr.in, CoinGecko, Hacker News, DummyJSON). No keys required.
> 📥 Template: [/learn/w35/template/activity-05-widget-builder](/learn/w35/template/activity-05-widget-builder)

A four-widget dashboard — Weather, Crypto, News, Quotes — composed from four free public APIs. The widget framework, template cloning, loading UI, and renderers are wired up. You'll write the four `fetch` calls that turn the loaders into real network requests.

**Time:** ~90 minutes · **Concept:** Concept 05 — Modular API integration

---

## What You'll Build

Four `fetch` loaders, each hitting a different real API:

| # | TODO | Function | API endpoint |
|---|------|----------|--------------|
| 1 | Weather for any city | `loadWeatherData(city)` | `https://wttr.in/{city}?format=j1` |
| 2 | Live crypto prices | `loadCryptoData(idsCsv)` | `https://api.coingecko.com/api/v3/simple/price?ids=...&vs_currencies=usd&include_24hr_change=true` |
| 3 | Top Hacker News stories | `loadNewsData(count)` | `https://hacker-news.firebaseio.com/v0/topstories.json` + `/item/{id}.json` |
| 4 | One random quote | `loadQuoteData()` | `https://dummyjson.com/quotes/random` |

The renderers (`renderWeather`, `renderCrypto`, `renderNews`, `renderQuote`) are already implemented — your TODOs feed them the right shape and the page just works.

The News widget is the only multi-step one: `topstories.json` returns ~500 ids, then you `Promise.all` the first `count` `/item/{id}.json` calls in parallel.

## Run It

```bash
python3 -m http.server 8001
```

Open `http://localhost:8001`. Opening `index.html` directly via `file://` will hit CORS — use the local server.

## Verify

Your activity is done when:

- [ ] Open DevTools → Network → reload the page → confirm a real GET request fires for the active widget and returns 200.
- [ ] **Weather** for `London` shows live current temperature, humidity, wind, and pressure (matches an external check within a degree or two). The Network tab shows a request to `wttr.in`.
- [ ] **Weather** for `Kuala Lumpur` returns real data; switching cities triggers a new GET.
- [ ] **Crypto** with input `bitcoin,ethereum,solana` shows three live USD prices and signed 24h % change; Network tab shows a request to `api.coingecko.com`.
- [ ] **News** shows 10 real story titles with author and score; Network tab shows one `/topstories.json` request followed by 10 parallel `/item/{id}.json` requests (check the waterfall — they overlap).
- [ ] **Quotes** shows different text on each "New Quote" click; Network tab shows a request to `dummyjson.com/quotes/random`.
- [ ] No mock data, no `setTimeout(fakeResponse)`, no hardcoded JSON anywhere in `script.js`.

## Stretch

Pick one and write a short note in your reflection about what you tried:
- Cache the Hacker News `/topstories.json` array in `localStorage` for 5 minutes — only the per-item fetches should fire on rapid refreshes.
- Add a fifth widget backed by another keyless API (e.g. `https://api.github.com/repos/{owner}/{repo}` or `https://catfact.ninja/fact`).
- Add an auto-refresh toggle per widget (different intervals — crypto every 30s, news every 5 minutes, weather every 10 minutes).

## 🪞 Reflect on Your Work

Answer in 2-3 sentences each, in this README under your TODO commits. Your tutor reads these as part of grading.

1. **What did you learn that you didn't know before?** Name the most surprising thing — a quirk of the JSON shape (wttr.in's stringly-typed numbers, CoinGecko's keyed object), a way `Promise.all` waterfalled in DevTools, a CORS error you had to work around.
2. **How did you collaborate with AI?** If you used Claude / ChatGPT / Cursor / Copilot, what part of the work did *you* contribute — the prompt, the verification, the design decision, the bug-fix? If you didn't use AI, what was the hardest thing to figure out alone?
3. **How do you know your code works?** Describe one specific thing you did to confirm — a Network tab inspection, a `console.log` of a parsed object, a comparison against an external source (e.g. opening `wttr.in/London` in another tab to cross-check the temperature).

> AI is a great collaborator. Owning your thinking, verifying the output, and explaining your design choices is what *learning* looks like in this course.

## Submit

When the Verify checklist is green, head to **[/learn/w35/certification](/learn/w35/certification)** and submit your activity link with screenshots showing all four widgets backed by real data and a Network tab proving the GET requests fired.

<!-- claude-template-fix: readme-v3 -->
