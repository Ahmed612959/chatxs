export async function onRequestPost({ request, env }) {
  try {
    const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.text();

    let upstream;
    try {
      upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://school-x.pages.dev',
          'X-Title': 'School X'
        },
        body
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لـ OpenRouter' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.ok || !upstream.body) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
      });
    }

    const upstreamReader = upstream.body.getReader();
    const safeStream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await upstreamReader.read();
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
        } catch (err) {
          try {
            controller.enqueue(new TextEncoder().encode(
              `data: {"error":{"message":"انقطع الاتصال بـ OpenRouter أثناء الرد"}}\n\n`
            ));
          } catch (e) {}
          controller.close();
        }
      },
      cancel() {
        try { upstreamReader.cancel(); } catch (e) {}
      }
    });

    return new Response(safeStream, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
