// ==========================================
// W35 Activity 05: Widget Builder — Real Public APIs
// ==========================================
// Four widgets, four free public APIs, no keys, no mocks.
// You're writing the four `fetch` calls that turn the loaders into real
// network requests. The DOM cloning, loading UI, and renderers are wired up.

const APIS = {
    weather: 'https://wttr.in',                                   // wttr.in/{city}?format=j1
    crypto:  'https://api.coingecko.com/api/v3/simple/price',     // ?ids=...&vs_currencies=usd&include_24hr_change=true
    news:    'https://hacker-news.firebaseio.com/v0',             // /topstories.json + /item/{id}.json
    quotes:  'https://dummyjson.com/quotes/random'                // returns { id, quote, author }
};

// ---- Widget state ----
let activeWidget = null;

// ---- Bootstrap ----
document.addEventListener('DOMContentLoaded', () => {
    // Pre-load the first widget so the page isn't empty.
    loadWidget('weather');
});

// ==========================================
// Widget framework — already implemented
// ==========================================
async function loadWidget(widgetType) {
    activeWidget = widgetType;

    document.getElementById('widgetContainer').style.display = 'block';
    document.getElementById('widgetTitle').textContent = getWidgetTitle(widgetType);

    const template = document.querySelector(`.widget-template[data-widget="${widgetType}"]`);
    const widgetContent = document.getElementById('widgetContent');

    if (template) {
        widgetContent.innerHTML = template.innerHTML;
        await initializeWidget(widgetType);
    }

    document.getElementById('widgetContainer').scrollIntoView({ behavior: 'smooth' });
}

function getWidgetTitle(widgetType) {
    const titles = {
        weather: '🌤️ Weather Widget',
        crypto:  '🪙 Crypto Widget',
        news:    '📰 Hacker News Widget',
        quotes:  '💭 Random Quote Widget'
    };
    return titles[widgetType] || 'Widget';
}

async function initializeWidget(widgetType) {
    try {
        switch (widgetType) {
            case 'weather': await loadWeatherData('London');                 break;
            case 'crypto':  await loadCryptoData('bitcoin,ethereum,solana'); break;
            case 'news':    await loadNewsData(10);                          break;
            case 'quotes':  await loadQuoteData();                           break;
        }
    } catch (error) {
        console.error(`Error initializing ${widgetType} widget:`, error);
        showWidgetError(error.message);
    }
}

async function refreshWidget() {
    if (activeWidget) await initializeWidget(activeWidget);
}

function closeWidget() {
    document.getElementById('widgetContainer').style.display = 'none';
    activeWidget = null;
}

// ==========================================
// TODO 1: loadWeatherData(city)
// API: GET `${APIS.weather}/{city}?format=j1`  (wttr.in returns JSON when format=j1)
// Shape you care about:
//   data.nearest_area[0].areaName[0].value         → city name
//   data.nearest_area[0].country[0].value          → country name
//   data.current_condition[0].temp_C               → temperature in °C (string)
//   data.current_condition[0].FeelsLikeC           → feels-like (string)
//   data.current_condition[0].humidity             → humidity %
//   data.current_condition[0].windspeedKmph        → wind speed
//   data.current_condition[0].pressure             → pressure hPa
//   data.current_condition[0].weatherDesc[0].value → text description
// Pass an object with { name, country, temp, feelsLike, humidity, windSpeed, pressure, description }
// to renderWeather(weather). Note: wttr.in fields are strings — coerce numbers as needed.
// Verify: clicking "Get Weather" with city="London" fires a real GET to wttr.in
// (DevTools → Network → filter wttr.in → status 200), and the temperature
// matches an external check within a degree or two.
// ==========================================
async function loadWeatherData(city) {
    const display = document.getElementById('weatherDisplay');
    display.innerHTML = '<div class="loading">Loading weather data...</div>';

    try {
        const res = await fetch(`${APIS.weather}/${encodeURIComponent(city)}?format=j1`);
        if (!res.ok) {
            throw new Error(`Weather service responded with status: ${res.status}`);
        }
        const data = await res.json();

        const area = data.nearest_area?.[0];
        const cond = data.current_condition?.[0];

        if (!cond) {
            throw new Error(`No weather data found for "${city}"`);
        }

        const weather = {
            name: area?.areaName?.[0]?.value || city,
            country: area?.country?.[0]?.value || '',
            temp: cond.temp_C,
            feelsLike: cond.FeelsLikeC,
            humidity: cond.humidity,
            windSpeed: cond.windspeedKmph,
            pressure: cond.pressure,
            description: cond.weatherDesc?.[0]?.value || ''
        };

        renderWeather(weather);
    } catch (error) {
        console.error('Weather error:', error);
        display.innerHTML = `<div class="error">
            <h3>Weather Error</h3>
            <p>Could not load weather for "${city}". ${error.message}</p>
        </div>`;
    }
}

async function updateWeather() {
    const city = document.getElementById('weatherCity').value.trim();
    if (!city) { alert('Please enter a city name'); return; }
    await loadWeatherData(city);
}

// ==========================================
// TODO 2: loadCryptoData(idsCsv)
// API: GET `${APIS.crypto}?ids={idsCsv}&vs_currencies=usd&include_24hr_change=true`
// CoinGecko ids are lowercase coin slugs ("bitcoin", "ethereum", "solana", ...).
// Response shape (object keyed by id):
//   { bitcoin:  { usd: 75391.0, usd_24h_change: -2.41 },
//     ethereum: { usd:  2236.1, usd_24h_change: -3.86 }, ... }
// Convert that object into an array of { id, priceUsd, change24h } and pass
// it to renderCrypto(rows).
// Verify: with input "bitcoin,ethereum,solana" the table shows three live USD
// prices and signed % change; DevTools → Network shows a request to api.coingecko.com.
// ==========================================
async function loadCryptoData(idsCsv) {
    const display = document.getElementById('cryptoDisplay');
    display.innerHTML = '<div class="loading">Loading crypto prices...</div>';

    try {
        const cleanIds = idsCsv.split(',').map(id => id.trim()).filter(Boolean).join(',');
        const res = await fetch(`${APIS.crypto}?ids=${encodeURIComponent(cleanIds)}&vs_currencies=usd&include_24hr_change=true`);
        if (!res.ok) {
            throw new Error(`Crypto API responded with status: ${res.status}`);
        }
        const data = await res.json();

        const rows = Object.entries(data).map(([id, info]) => ({
            id: id,
            priceUsd: info.usd,
            change24h: info.usd_24h_change
        }));

        renderCrypto(rows);
    } catch (error) {
        console.error('Crypto error:', error);
        display.innerHTML = `<div class="error">
            <h3>Crypto Error</h3>
            <p>Could not load prices. ${error.message}</p>
        </div>`;
    }
}

async function updateCrypto() {
    const idsCsv = document.getElementById('cryptoIds').value.trim().toLowerCase();
    if (!idsCsv) { alert('Enter at least one CoinGecko id (e.g. bitcoin,ethereum)'); return; }
    await loadCryptoData(idsCsv);
}

// ==========================================
// TODO 3: loadNewsData(count)
// Two-step API: Hacker News topstories returns an array of ~500 ids.
//   Step 1: GET `${APIS.news}/topstories.json` → array of integers
//   Step 2: For the first `count` ids, GET `${APIS.news}/item/{id}.json` in
//           parallel with Promise.all. Each item has { title, by, score, url, id }.
//   (Some items have no `url` — use `https://news.ycombinator.com/item?id={id}` as fallback.)
// Pass the array of items to renderNews(stories).
// Verify: the list shows `count` real story titles with author + score; DevTools →
// Network shows one request to /topstories.json and `count` parallel requests to /item/*.
// ==========================================
async function loadNewsData(count) {
    const display = document.getElementById('newsDisplay');
    display.innerHTML = '<div class="loading">Loading top stories...</div>';

    try {
        const topRes = await fetch(`${APIS.news}/topstories.json`);
        if (!topRes.ok) {
            throw new Error(`Hacker News API responded with status: ${topRes.status}`);
        }
        const topIds = await topRes.json();
        const targetIds = topIds.slice(0, count);

        const stories = await Promise.all(
            targetIds.map(async (id) => {
                const itemRes = await fetch(`${APIS.news}/item/${id}.json`);
                if (!itemRes.ok) {
                    throw new Error(`Failed to fetch story item ${id}`);
                }
                return await itemRes.json();
            })
        );

        renderNews(stories);
    } catch (error) {
        console.error('News error:', error);
        display.innerHTML = `<div class="error">
            <h3>News Error</h3>
            <p>Could not load top stories. ${error.message}</p>
        </div>`;
    }
}

async function updateNews() {
    const count = parseInt(document.getElementById('newsCount').value, 10) || 10;
    await loadNewsData(Math.min(20, Math.max(3, count)));
}

// ==========================================
// TODO 4: loadQuoteData()
// API: GET `${APIS.quotes}` — DummyJSON returns { id, quote, author }.
// Pass { content, author } to renderQuote(...).
// Verify: each click on "New Quote" produces a different quote text; the request
// is visible in DevTools → Network with status 200.
// ==========================================
async function loadQuoteData() {
    const display = document.getElementById('quotesDisplay');
    display.innerHTML = '<div class="loading">Loading random quote...</div>';

    try {
        const res = await fetch(APIS.quotes);
        if (!res.ok) {
            throw new Error(`Quote API responded with status: ${res.status}`);
        }
        const data = await res.json();

        renderQuote({
            content: data.quote,
            author: data.author
        });
    } catch (error) {
        console.error('Quote error:', error);
        display.innerHTML = `<div class="error">
            <h3>Quote Error</h3>
            <p>Could not load a quote. ${error.message}</p>
        </div>`;
    }
}

async function getNewQuote() {
    await loadQuoteData();
}

// ==========================================
// Renderers — already implemented.
// Your TODOs feed these the right shape and the page just works.
// ==========================================

function renderWeather(weather) {
    const display = document.getElementById('weatherDisplay');
    display.innerHTML = `
        <div class="weather-main">
            <h3>${weather.name}, ${weather.country}</h3>
            <div class="weather-temp">${weather.temp}°C</div>
            <div class="weather-description">${weather.description}</div>
        </div>
        <div class="weather-details">
            <div class="weather-detail"><strong>Feels like</strong><br>${weather.feelsLike}°C</div>
            <div class="weather-detail"><strong>Humidity</strong><br>${weather.humidity}%</div>
            <div class="weather-detail"><strong>Wind</strong><br>${weather.windSpeed} km/h</div>
            <div class="weather-detail"><strong>Pressure</strong><br>${weather.pressure} hPa</div>
        </div>
    `;
}

function renderCrypto(rows) {
    const display = document.getElementById('cryptoDisplay');
    if (!rows || rows.length === 0) {
        display.innerHTML = '<p>No prices to show.</p>';
        return;
    }
    display.innerHTML = `
        <table class="crypto-table">
            <thead><tr><th>Coin</th><th>Price (USD)</th><th>24h Change</th></tr></thead>
            <tbody>
                ${rows.map(r => {
                    const sign = r.change24h >= 0 ? '+' : '';
                    const cls  = r.change24h >= 0 ? 'gain' : 'loss';
                    const price = typeof r.priceUsd === 'number' ? r.priceUsd.toLocaleString('en-US', { maximumFractionDigits: 2 }) : r.priceUsd;
                    const chg   = typeof r.change24h === 'number' ? r.change24h.toFixed(2) : r.change24h;
                    return `<tr>
                        <td class="coin-id">${r.id}</td>
                        <td>$${price}</td>
                        <td class="${cls}">${sign}${chg}%</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderNews(stories) {
    const display = document.getElementById('newsDisplay');
    if (!stories || stories.length === 0) {
        display.innerHTML = '<p>No stories to show.</p>';
        return;
    }
    display.innerHTML = `
        <ol class="news-list">
            ${stories.map(s => {
                const link = s.url || `https://news.ycombinator.com/item?id=${s.id}`;
                return `<li class="news-item">
                    <a href="${link}" target="_blank" rel="noopener noreferrer">${s.title}</a>
                    <small>${s.score} pts · by ${s.by}</small>
                </li>`;
            }).join('')}
        </ol>
    `;
}

function renderQuote(quote) {
    const display = document.getElementById('quotesDisplay');
    display.innerHTML = `
        <div class="quote-text">"${quote.content}"</div>
        <div class="quote-author">— ${quote.author}</div>
    `;
}

function showWidgetError(message) {
    const content = document.getElementById('widgetContent');
    content.innerHTML = `
        <div class="error">
            <h3>Widget Error</h3>
            <p>${message}</p>
            <button onclick="refreshWidget()" class="btn btn-primary">Try Again</button>
        </div>
    `;
}

// Export for inline onclick handlers
window.loadWidget = loadWidget;
window.refreshWidget = refreshWidget;
window.closeWidget = closeWidget;
window.updateWeather = updateWeather;
window.updateCrypto = updateCrypto;
window.updateNews = updateNews;
window.getNewQuote = getNewQuote;

// claude-template-fix: real-apis-v1
