import { GeminiAdapter } from './geminiAdapter';
import type { AiAdapter } from './types';

// This is the factory for our AI adapters.
// Currently, it's hardcoded to Gemini, but could be extended
// to use other adapters based on environment variables.
const aiAdapter: AiAdapter = new GeminiAdapter();

export default aiAdapter;
