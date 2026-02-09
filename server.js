const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
const port = 3000;
const parser = new Parser();

app.use(cors());

const sources = [
  { name: "UN", url: "https://news.un.org/feed/rss", color: "#009688" },
  { name: "NATO", url: "https://www.nato.int/cps/en/natohq/news_151603.xml", color: "#3b82f6" },
  { name: "EU", url: "https://www.eeas.europa.eu/rss-feed/press_en", color: "#ef4444" },
  { name: "USA", url: "https://www.state.gov/rss-feed/press-releases-feed/", color: "#8b5cf6" },
  { name: "UK", url: "https://www.gov.uk/government/organisations/foreign-commonwealth-development-office.atom", color: "#f59e0b" }
];

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="mk">
<head>
    <meta charset="UTF-8">
    <title>🌍 World Diplomatic News</title>
    <style>
        body { background: #020617; color: white; text-align: center; padding: 40px; font-family: Arial; }
        .logo { font-size: 48px; margin: 20px; color: #6366f1; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        h1 { font-size: 2.3rem; background: linear-gradient(45deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .news { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin: 30px 0; max-width: 1200px; margin-left: auto; margin-right: auto; }
        .card { background: rgba(30,41,59,0.9); padding: 20px; border-radius: 15px; text-align: left; }
        .card:hover { transform: translateY(-5px); transition: transform 0.3s; }
        .source { font-weight: bold; margin-bottom: 8px; }
        .title { font-size: 1.1rem; margin-bottom: 8px; color: #f8fafc; }
        .date { font-size: 0.8rem; color: #94a3b8; margin-bottom: 12px; }
        .desc { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
        .link { color: #6366f1; text-decoration: none; font-weight: bold; }
        .stats { display: flex; justify-content: center; gap: 25px; margin: 25px 0; }
        .stat { background: rgba(30,41,59,0.8); padding: 15px; border-radius: 15px; min-width: 120px; }
        .number { font-size: 2rem; color: #6366f1; font-weight: bold; }
        footer { margin-top: 30px; color: #64748b; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="logo">WDN</div>
    <h1>WORLD DIPLOMATIC NEWS</h1>
    <p>🌍 Агрегатор на дипломатски вести</p>
    
    <div class="stats">
        <div class="stat"><div class="number" id="count">0</div>Вести</div>
        <div class="stat"><div class="number">150+</div>Јазици</div>
        <div class="stat"><div class="number">7</div>ИИ системи</div>
    </div>
    
    <div class="news" id="news">
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #94a3b8;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(99,102,241,0.3); border-top: 3px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px;"></div>
            <div style="animation: spin 1s linear infinite; display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(99,102,241,0.3); border-left: 3px solid #6366f1; border-radius: 50%; margin-bottom: 15px;"></div>
            <p>Вчитување на вистински вести од ООН, НАТО, ЕУ...</p>
        </div>
    </div>
    
    <div style="background: rgba(245,158,11,0.1); border: 1px solid #f59e0b; border-radius: 10px; padding: 12px; margin: 25px auto; max-width: 500px; font-size: 1.1rem;">
        📧 <a href="mailto:worlddiplomaticnews@outlook.com" style="color: #f59e0b; text-decoration: none; font-weight: bold;">worlddiplomaticnews@outlook.com</a>
    </div>
    
    <footer>
        <p>© 2026 World Diplomatic News - Сите права задржани</p>
    </footer>

    <script>
        async function loadNews() {
            try {
                const response = await fetch('/api/news');
                const news = await response.json();
                document.getElementById('count').textContent = news.length;
                document.getElementById('news').innerHTML = news.map(item => \`
                    <div class="card">
                        <div class="source" style="color: \${item.color};">\${item.source}</div>
                        <div class="date">\${item.pubDate}</div>
                        <div class="title">\${item.title}</div>
                        <div class="desc">\${item.description}</div>
                        <a href="\${item.link}" target="_blank" class="link">Читај повеќе →</a>
                    </div>
                \`).join('');
            } catch (e) {
                document.getElementById('news').innerHTML = \`<div style="grid-column:1/-1;color:#f87171;padding:30px;">⚠️ Грешка при вчитување. Обиди се повторно подоцна.</div>\`;
            }
        }
        loadNews();
    </script>
</body>
</html>
  `);
});

app.get('/api/news', async (req, res) => {
  let allNews = [];
  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      const items = feed.items.slice(0, 3).map(item => ({
        title: item.title || 'Без наслов',
        description: (item.contentSnippet || '').replace(/<[^>]*>?/gm, '').substring(0, 120) + '...',
        link: item.link || '#',
        pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString('mk-MK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Денес',
        source: source.name,
        color: source.color
      }));
      allNews = [...allNews, ...items];
    } catch (e) {}
  }
  res.json(allNews.slice(0, 15));
});

app.listen(port, () => {
  console.log(\`🚀 Server running on port \${port}\`);
});
