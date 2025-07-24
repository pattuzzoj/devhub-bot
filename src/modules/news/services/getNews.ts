const GNEWS_API_KEY = process.env['GNEWS_API_KEY'];

const query = encodeURIComponent(`(programação OR desenvolvimento OR software OR IA OR AI OR blockchain OR cloud OR segurança) AND (github OR openai OR microsoft OR google OR meta OR amazon OR ibm OR nvidia OR intel OR amd OR apple)`);

export default async function getNews({ limit = 10 }: { limit: number }) {
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=pt&max=${limit}&apikey=${GNEWS_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao buscar notícias');
  }

  const data = await response.json();
  return data?.articles || [];
}