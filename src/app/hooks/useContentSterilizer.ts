import { useState } from 'react';

export const useContentSterilizer = () => {
  const [loading, setLoading] = useState(false);
  const [sterilizedContent, setSterilizedContent] = useState<string>('');

  const sterilizeContent = async (rawInput: string) => {
    setLoading(true);

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME;

    if (!apiKey || !siteUrl || !siteName) {
      throw new Error("Missing environment variables for OpenRouter API");
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': siteUrl,
          'X-Title': siteName,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528:free',
          messages: [
            {
              role: 'user',
              content: `Analiza y esteriliza el siguiente contenido. Devuelve el resultado como contenido HTML con clases de Tailwind CSS aplicadas. Puedes modificar el contenido a tu antojo para mejorarlo, corregirlo o estructurarlo mejor. Solo devuelve el HTML limpio, sin explicaciones ni texto adicional.

Contenido original:
${rawInput}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Respuesta vacía del modelo');
      }

      setSterilizedContent(content.trim());
    } catch (err) {
      console.error(err);
      setSterilizedContent('');
    } finally {
      setLoading(false);
    }
  };

  return { sterilizedContent, loading, sterilizeContent };
};