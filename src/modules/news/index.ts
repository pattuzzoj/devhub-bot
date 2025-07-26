import { Client, TextChannel } from "discord.js";
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

async function sendNews(client: Client<boolean>) {
  let articles = await getNews({ limit: 2 }) as Article[];

  if (articles.length === 0) {
    console.log('Nenhuma notícia encontrada no momento.');
    return;
  }

  const newsChannel = await client.channels.fetch(process.env['NEWS_CHANNEL_ID']!) as TextChannel;
  const oldNewsMessages = await newsChannel.messages.fetch({ limit: 5 });

  for (const oldNew of oldNewsMessages.values()) {
    const embeds = oldNew.embeds;
    if (embeds.length > 0) {
      const oldTitle = embeds[0].data.title
      //@ts-ignore
      articles = articles.map(article => {
        if (article.title !== oldTitle) {
          return article;
        }
      })
    }
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
  init: (client: Client<boolean>) => {
    const task = cron.schedule('*/30 * * * *', () => {
      sendNews(client);
    });

    // Scheduler para parar
    cron.schedule('0 22 * * *', () => {
      task.stop();
    });

    // Scheduler para iniciar
    cron.schedule('0 10 * * *', () => {
      task.start();
    });

    // Para a task se estivermos fora do horário ao reiniciar o servidor
    const now = new Date();
    const hour = now.getHours();
    if (hour < 10 || hour >= 22) {
      task.stop();
    }
  }
}

export default newsModule;