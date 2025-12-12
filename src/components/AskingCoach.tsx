import { createSignal, Show } from 'solid-js';

type Scenario = {
  id: string;
  title: string;
  description: string;
  hint: string;
};

const scenarios: Scenario[] = [
  {
    id: 'network-followup',
    title: 'Networking follow-up',
    description:
      'You met a senior professional at an event who mentioned an internal resource list that could massively help your current project.',
    hint:
      'Aim for a focused, low-effort ask: one document/link or a specific recommendation, clear why you need it and how you will use it.',
  },
  {
    id: 'project-help',
    title: 'Project design help',
    description:
      'You are racing to finish a portfolio and your designer friend is busy but much better at visuals than you.',
    hint:
      'Ask for specific, time-boxed help on the hardest part (e.g., reviewing 3–5 prepared options) instead of “can you fix everything?”.',
  },
  {
    id: 'intro-investor',
    title: 'Warm intro to investor',
    description:
      'A mentor knows an investor who could be a great fit for your startup.',
    hint:
      'Be clear what the intro is for, why now, and make it easy to forward with a short, sharp blurb.',
  },
  {
    id: 'custom',
    title: 'Your own scenario',
    description:
      'Describe a real situation where you want to ask for help, feedback, or an introduction.',
    hint:
      'Briefly describe the context, then use the ask box to write the exact message you would send.',
  },
];

export default function AskingCoach() {
  const [selectedId, setSelectedId] = createSignal(scenarios[0].id);
  const [ask, setAsk] = createSignal('');
  const [customScenario, setCustomScenario] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [result, setResult] = createSignal<{
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    suggestedRewrite: string;
  } | null>(null);

  const currentScenario = () =>
    scenarios.find((s) => s.id === selectedId()) ?? scenarios[0];

  const isCustom = () => selectedId() === 'custom';

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/askcoach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedId(),
          scenarioText: isCustom() ? customScenario() : currentScenario().description,
          ask: ask(),
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Something went wrong. Please try again.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = () =>
    ask().trim().length >= 20 &&
    (!isCustom() || customScenario().trim().length >= 20);

  return (
    <section class="w-full max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white px-6 py-8 md:px-8 md:py-10 shadow-md">
      <header class="mb-6 md:mb-8">
        <h2 class="text-3xl font-semibold tracking-tight text-slate-900">
          Asking Coach
        </h2>
        <p class="mt-2 text-lg text-slate-700">
          Practice framing your ask so it is clear, specific, and respectful of the other person’s time.
        </p>
      </header>

      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-xl font-medium text-slate-900">Choose a scenario</h3>
          <p class="text-base text-slate-700">
            Start from a template or bring your own real situation.
          </p>
          <div class="grid gap-4 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <button
                type="button"
                class={`flex h-full w-full flex-col rounded-xl border p-4 text-left transition
                ${
                  selectedId() === scenario.id
                    ? 'border-blue-600 bg-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedId(scenario.id)}
              >
                <span class="text-lg font-semibold text-slate-900">
                  {scenario.title}
                </span>
                <span class="mt-1 text-base text-slate-700">
                  {scenario.description}
                </span>
                <span class="mt-2 text-sm text-slate-500">
                  Hint: {scenario.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form class="space-y-6" onSubmit={handleSubmit}>
          <Show when={isCustom()}>
            <div>
              <label
                for="customScenario"
                class="mb-1 block text-lg font-medium text-slate-900"
              >
                Describe your scenario
              </label>
              <p class="mb-2 text-base text-slate-700">
                Share who you are asking, what is happening, and what you are working on.
              </p>
              <textarea
                id="customScenario"
                rows={4}
                class="block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Example: I’m preparing to pitch my startup to a potential advisor next week and want to ask them for a short feedback call..."
                value={customScenario()}
                onInput={(e) =>
                  setCustomScenario((e.target as HTMLTextAreaElement).value)
                }
              />
            </div>
          </Show>

          <div>
            <label
              for="ask"
              class="mb-1 block text-lg font-medium text-slate-900"
            >
              Write your ask
            </label>
            <p class="mb-2 text-base text-slate-700">
              Write the exact message you would send. Be clear about what you want, how much time it takes, and by when.
            </p>
            <textarea
              id="ask"
              rows={7}
              class="block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Example: Could you spare 20 minutes this Friday to review three short options and help me decide which one to use for my launch?"
              value={ask()}
              onInput={(e) =>
                setAsk((e.target as HTMLTextAreaElement).value)
              }
            />
          </div>

          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="submit"
              disabled={loading() || !canSubmit()}
              class="inline-flex w-full md:w-auto items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading() ? 'Scoring…' : 'Score my ask'}
            </button>
            <p class="text-sm md:text-base text-slate-600">
              Tip: Avoid vague asks like “Can I pick your brain?”. Make your ask small, specific, and easy to say yes to.
            </p>
          </div>
        </form>

        {error() && (
          <p class="text-base text-red-600">
            {error()}
          </p>
        )}

        {result() && (
          <section class="mt-4 space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
              <h3 class="text-2xl font-semibold text-slate-900">
                Score: {result()!.score} / 10
              </h3>
              <p class="text-base text-slate-700">
                {result()!.summary}
              </p>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <h4 class="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  What you did well
                </h4>
                <ul class="mt-2 list-disc space-y-1 pl-5 text-base text-slate-800">
                  {result()!.strengths.map((item) => (
                    <li>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 class="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  How to improve
                </h4>
                <ul class="mt-2 list-disc space-y-1 pl-5 text-base text-slate-800">
                  {result()!.improvements.map((item) => (
                    <li>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-800">
                Suggested rewrite
              </h4>
              <p class="mt-2 rounded-lg bg-white px-4 py-3 text-base leading-relaxed text-slate-900 shadow-inner">
                {result()!.suggestedRewrite}
              </p>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
