import { Client } from "discord.js";
import cron from "node-cron";
import sendLog from "../../shared/utils/log";
import getNews from "./services/getNews";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
    url: string;
  };
}

const articlesId = new Set();

async function sendNews(client: Client<boolean>) {
  const articles = await getNews({ limit: 2 }) as Article[];

  if (articles.length === 0) {
    console.log('Nenhuma notícia encontrada no momento.');
    return;
  }

  for (const article of articles) {
    if (articlesId.has(String(article.id))) {
      continue;
    }

    await sendLog(client, {
      title: article.title,
      color: '#FFAF03',
      description: `${article.description}\n\n[Leia o artigo completo](${article.url})\n\nFonte: [${article.source.name}](${article.source.url})`,
      fields: []
    }, process.env['NEWS_CHANNEL_ID']!);

    articlesId.add(String(article.id));
  }
}

const newsModule = {
  load: (client: Client<boolean>) => {
    const task = cron.schedule('0 */30 * * * *', () => {
      sendNews(client);
    });

    // Scheduler para parar às 24h
    cron.schedule('0 0 * * *', () => {
      articlesId.clear();
      task.stop();
    });

    // Scheduler para iniciar às 8h
    cron.schedule('0 8 * * *', () => {
      task.start();
    });

    // Para a task se estivermos fora do horário ao reiniciar o servidor
    const now = new Date();
    const hour = now.getHours();
    if (hour < 8 || hour >= 24) {
      task.stop();
    }
  }
}

export default newsModule;