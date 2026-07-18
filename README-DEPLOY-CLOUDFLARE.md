# نشر School X على Cloudflare Pages

## الفرق عن Vercel
- المفاتيح بتتقرأ بـ `env.GROQ_API_KEY` بدل `process.env.GROQ_API_KEY`
- ملفات الـ API بقت في `functions/api/` بدل `api/` وبصيغة `onRequestPost({ request, env })` بدل `export default handler(request)`
- مفيش `vercel.json` أو `runtime: 'edge'` — Cloudflare Pages Functions شغالة على Workers جوه، ونفس صيغة Fetch API قياسية

## خطوات النشر (أول مرة)

1. ارفع المجلد ده على GitHub (repo جديد أو استبدل القديم)
2. روح **dash.cloudflare.com** → **Workers & Pages** → **Create application** → تبويب **Pages** → **Connect to Git**
3. اختار الـ repo بتاعك
4. في إعدادات الـ Build:
   - **Framework preset**: None
   - **Build command**: سيبه فاضي (مفيش build خالص، الموقع HTML ثابت)
   - **Build output directory**: `/` (أو `.`)
5. **قبل** أول Deploy، روح على **Settings → Environment variables** وضيف الأربعة مفاتيح:
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `OPENROUTER_API_KEY`
   - `CEREBRAS_API_KEY`
   
   مهم: ضيفهم لبيئة **Production** و**Preview** الاثنين، وإلا هيشتغلوا في واحدة بس
6. دوس **Save and Deploy**

## بعد النشر
- الموقع هيبقى على رابط زي `your-project.pages.dev` (تقدر تربط دومين خاص بعدين من Settings → Custom domains)
- جرب `https://your-project.pages.dev/api/health` — المفروض يرجع `{"groqConfigured":true,...}` لكل المفاتيح اللي ضفتها
- أي تعديل تعمله وترفعه على GitHub بعد كده بيعمل Deploy تلقائي من غير أي خطوة إضافية

## لو حصل خطأ
- Cloudflare Dashboard → مشروعك → **Deployments** → افتح آخر Deployment → **Functions** أو **Logs** لمشاهدة أي خطأ فعلي بدل الصفحة العامة
