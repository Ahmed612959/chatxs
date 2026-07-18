export async function onRequestPost({ request, env }) {
  try {
    const CEREBRAS_API_KEY = env.CEREBRAS_API_KEY;
    if (!CEREBRAS_API_KEY) {
      return new Response(JSON.stringify({ error: 'CEREBRAS_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.text();

    let upstream;
    try {
      upstream = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/event-stream'
        },
        body
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لـ Cerebras' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.ok) {
      const text = await upstream.text();
      const looksLikeHtml = text.trim().startsWith('<');
      return new Response(JSON.stringify({
        error: looksLikeHtml
          ? 'Cerebras رفض الطلب على مستوى الشبكة (صفحة حجب وليست رد API)'
          : text.slice(0, 500)
      }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.body) {
      return new Response(upstream.body, { status: upstream.status });
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
              `data: {"error":{"message":"انقطع الاتصال بـ Cerebras أثناء الرد"}}\n\n`
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
