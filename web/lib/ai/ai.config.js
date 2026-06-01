// Model routing — swap models via env vars without touching code
export const MODEL_JD_SCREENING = process.env.MODEL_JD_SCREENING ?? 'deepseek';
export const MODEL_CV_GENERATION = process.env.MODEL_CV_GENERATION ?? 'gpt-4o';

// Maps logical model names to Azure AI Foundry deployment names
export const MODEL_REGISTRY = {
  'gpt-4o':   process.env.AZURE_GPT4O_DEPLOYMENT   ?? 'gpt-4o',
  'deepseek': process.env.AZURE_DEEPSEEK_DEPLOYMENT ?? 'deepseek-r1',
};
