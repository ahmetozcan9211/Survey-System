import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, from = 'tr', to = 'en' } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Using MyMemory API (Free anonymous usage)
        // Note: Limited to ~1000 words/day for anonymous usage.
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
        const data = await response.json();

        if (data.responseStatus !== 200) {
            throw new Error(data.responseDetails || 'Translation failed');
        }

        return NextResponse.json({ translatedText: data.responseData.translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
    }
}
