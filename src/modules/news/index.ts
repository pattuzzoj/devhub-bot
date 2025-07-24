import { Client } from "discord.js";
import cron from "node-cron";
import sendLog from "../../shared/utils/log";

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

const GNEWS_API_KEY = process.env['GNEWS_API_KEY'];

const query = encodeURIComponent(`"desenvolvimento de software" OR "engenharia de software" OR "ciência da computação" OR blockchain OR ia OR iot OR amd OR intel OR nvidia OR apple OR microsoft OR google OR ibm OR meta`);

async function getTechNews() {
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=pt&country=br&max=1&apikey=${GNEWS_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao buscar notícias');
  }

  const data = await response.json();
  return data?.articles || [];
}

async function sendNews(client: Client<boolean>) {
  const articles = await getTechNews() as Article[];

  if (articles.length === 0) {
    console.log('Nenhuma notícia encontrada no momento.');
    return;
  }

  for (const article of articles) {
    await sendLog(client, {
      title: article.title,
      color: '#FFAF03',
      description: `${article.description}\n\n[Leia o artigo completo](${article.url})`,
      fields: []
    }, process.env['NEWS_CHANNEL_ID']!);
  }
}

const newsModule = {
  load: (client: Client<boolean>) => {
    cron.schedule('0 */30 * * * *', () => {
      sendNews(client);
    });
  }
}

export default newsModule;