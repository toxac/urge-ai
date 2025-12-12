import { createSignal } from 'solid-js';
import { generateText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

// Create DeepSeek instance


interface Props {
  key: string;
}

export default function DeepSeekChat(props: Props) {
  const [prompt, setPrompt] = createSignal('');
  const [response, setResponse] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const deepseek = createDeepSeek({
    apiKey: props.key,
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!prompt().trim()) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const { text } = await generateText({
        model: deepseek('deepseek-chat'),
        prompt: `Context: Write a essay, Topic for Essay: ${prompt()}`
      });

      setResponse(text);
    } catch (err) {
      setError(JSON.stringify(err));
    } finally {
      setPrompt("");
      setIsLoading(false);
    }
  };

  return (
    <div class="max-w-2xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">DeepSeek Chat</h2>

      <form onSubmit={handleSubmit} class="mb-6">
        <div class="mb-4">
          <textarea
            value={prompt()}
            onInput={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            rows="4"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading()}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading() || !prompt().trim()}
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading() ? 'Generating...' : 'Topic of Joke'}
        </button>
      </form>

      {error() && (
        <div class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          Error: {error()}
        </div>
      )}

      {response() && (
        <div>
          <h3 class="text-xl font-semibold mb-3">Response:</h3>
          <div class="p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">
            {response()}
          </div>
        </div>
      )}
    </div>
  );
};

