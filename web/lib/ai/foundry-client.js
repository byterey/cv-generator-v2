import { MODEL_REGISTRY } from './ai.config.js';

/**
 * Send a chat request to an Azure AI Foundry deployment.
 * @param {string} model - Logical model name (e.g. 'gpt-4o', 'deepseek')
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} [options] - Extra options: temperature, max_tokens, response_format
 * @returns {Promise<string>} - The assistant message content
 */
export async function chat(model, messages, options = {}) {
  const endpoint = process.env.AZURE_AI_ENDPOINT;
  const apiKey   = process.env.AZURE_AI_KEY;

  if (!endpoint || !apiKey) {
    throw new Error('AZURE_AI_ENDPOINT and AZURE_AI_KEY must be set');
  }

  const deployment = MODEL_REGISTRY[model];
  if (!deployment) {
    throw new Error(`Unknown model: ${model}. Add it to MODEL_REGISTRY.`);
  }

  console.log(`[ai] chat → deployment=${deployment} model=${model}`);

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-01`;

  const body = {
    messages,
    temperature: options.temperature ?? 0.3,
    max_tokens:  options.max_tokens  ?? 4096,
    ...(options.response_format ? { response_format: options.response_format } : {}),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure AI error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
