const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, 
});


async function generateCaption(base64ImageFile, language = 'english') {
    const langMap = {
        english: 'English',
        hindi: 'Hindi',
        gujarati: 'Gujarati'
    }

    const targetLang = langMap[(language || 'english').toLowerCase()] || 'English'

    const contents = [
        {
            inlineData: {
                mimeType: "image/jpeg",
                data: base64ImageFile,
            },
        },
        {
          text: `
You are a professional image captioning assistant.
Write only one clean, natural caption for the given image.
Rules:
1. Respond in ${targetLang}.
2. Do NOT use Markdown, bullet points, or any formatting characters like *, **, _, or quotes.
3. Do NOT include multiple caption options.
4. The caption must be concise, descriptive, and sound natural, suitable for social media.
5. Output plain text only (no lists, no headings, no extra words).
6. Caption should be between 50 to 150 words.
          `,
        }
    ];

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {   
        },
    
    });

    return response.text
}


module.exports = generateCaption