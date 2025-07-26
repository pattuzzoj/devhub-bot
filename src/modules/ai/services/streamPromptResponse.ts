async function streamPromptResponse(model: string, prompt: { system: string, data: object}) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env['AI_API_KEY']}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        {
          role: 'system',
          content: prompt.system,
        },
        {
          role: 'user',
          content: JSON.stringify(prompt.data),
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

async function tryModelsStreaming(prompt: object) {
  let lastError = null;

  for (const model of process.env['AI_MODELS']!.split(',').map(s => s.trim())) {
    try {
      console.log(`Tentando modelo: ${model}`);
      const result = await streamPromptResponse(model, prompt as any);
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

export default async function fetchStreamResponse(prompt: object) {
  const result = await tryModelsStreaming(prompt);

  if (!result) {
    throw new Error('Nenhum modelo conseguiu responder.');
  }
  
  return result;
}