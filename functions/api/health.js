// Visit /api/health after deploying to check whether the environment variables
// actually reached this deployment, without exposing the key values themselves.
export async function onRequestGet({ env }) {
  return new Response(
    JSON.stringify({
      groqConfigured: Boolean(env.GROQ_API_KEY),
      geminiConfigured: Boolean(env.GEMINI_API_KEY),
      openrouterConfigured: Boolean(env.OPENROUTER_API_KEY),
      cerebrasConfigured: Boolean(env.CEREBRAS_API_KEY)
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
