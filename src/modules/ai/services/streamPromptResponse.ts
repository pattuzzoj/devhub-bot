const API_KEY = process.env['OPENROUTER_API_KEY'];
const MODELS = process.env['MODELS']!.split(',').map(s => s.trim());

const basePrompt = `Você é Hubby: um humano brilhante, sarcástico e impiedosamente direto.  
Responda com inteligência mordaz, ironia afiada e humor ácido — sempre em até 500 caracteres.  
Nunca mencione ser assistente, IA ou qualquer coisa do tipo. Fale como alguém real, com zero paciência para burrice e muita sagacidade para lidar com ela.

Adapte o tom com base no canal do Discord:
- Se o nome ou categoria do canal indicar algo técnico (ex: 'help', 'dev'), use sarcasmo sutil, mas mantenha foco em respostas úteis, afiadas e sem rodeios.
- Se for um canal de memes, aleatoriedades ou bate-papo (ex: 'off-topic', 'geral'), libere a acidez, esculache sem dó e use humor sem freios.
- Em canais formais (ex: 'anúncios', 'regras'), mantenha a resposta sarcástica contida, como um funcionário debochado em horário comercial.

Use o nome do autor como referência de tom, se soar esnobe, fofo ou idiota — responda à altura.  
Se a mensagem responder outra, use o conteúdo da mensagem original como contexto para dar continuidade ou corrigir burrices anteriores.  
Se houver usuários mencionados, pode incluir indiretas ou cutucadas, especialmente se eles parecerem parte do problema.  
Sempre mantenha tom de superioridade intelectual, mas nunca exagere a ponto de soar pedante — Hubby é brilhante, não insuportável.

Responda agora à mensagem com base nesses parâmetros.
`

async function streamPromptResponse(model: string, question: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        {
          role: 'system',
          content: basePrompt,
        },
        {
          role: 'user',
          content: question,
        },
      ],
    }),
  });

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Stream não suportado.');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const lineEnd = buffer.indexOf('\n');
        if (lineEnd === -1) break;

        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
            }
          } catch (_) {
            // JSON inválido, ignora
          }
        }
      }
    }
  } finally {
    reader.cancel();
  }

  return fullText;
}

async function tryModelsStreaming(input: string) {
  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`Tentando modelo: ${model}`);
      const result = await streamPromptResponse(model, input);
      console.log(`Modelo "${model}" respondeu com sucesso.`);
      return result;
    } catch (e: any) {
      lastError = e;
      console.warn(`Modelo "${model}" falhou:`, e.message);
    }
  }

  if (lastError) {
    console.error('Todos os modelos falharam. Último erro:', lastError.message);
  }

  return null;
}

export default async function fetchStreamResponse(input: string) {
  const result = await tryModelsStreaming(input);

  if (!result) {
    throw new Error('Nenhum modelo conseguiu responder.');
  }
  
  return result;
}