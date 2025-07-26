const queries = [
  // 1. Query original com AND — ampla, com tópicos e big techs
  encodeURIComponent(`(programação OR desenvolvimento OR software OR IA OR AI OR blockchain OR cloud OR segurança) AND (github OR openai OR microsoft OR google OR meta OR amazon OR ibm OR nvidia OR intel OR amd OR apple)`),

  // 2. Linguagens, frameworks e ferramentas
  encodeURIComponent(`python OR django OR flask OR "fastapi" OR javascript OR "node.js" OR react OR vue OR angular OR java OR "spring boot" OR php OR laravel`),

  // 3. Inovação, LLMs e tecnologias emergentes
  encodeURIComponent(`LLM OR transformers OR "deep learning" OR "agentes autônomos" OR web3 OR "edge computing" OR "stable diffusion" OR whisper OR "fine-tuning" OR "prompt engineering" OR quantização`),

  // 4. DevOps, arquitetura e produtividade
  encodeURIComponent(`DevOps OR kubernetes OR docker OR terraform OR ansible OR observabilidade OR microserviços OR "arquitetura hexagonal" OR DDD OR "CI/CD" OR "testes automatizados"`),

  // 5. Ética, impacto e regulação
  encodeURIComponent(`"viés algorítmico" OR "privacidade digital" OR "governança de IA" OR "código aberto" OR "regulação tecnológica" OR "segurança cibernética"`)
];

function randomQuery() {
  return queries[Math.floor(Math.random() * queries.length)];
}

export default async function getNews({ limit = 10 }: { limit: number }) {
  const url = `https://gnews.io/api/v4/search?q=${randomQuery()}&lang=pt&max=${limit}&apikey=${process.env['GNEWS_API_KEY']!}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao buscar notícias');
  }

  const data = await response.json();
  return data?.articles || [];
}