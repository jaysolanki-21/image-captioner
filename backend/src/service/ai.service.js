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
        { text: `Caption this image. Respond in ${targetLang}.` },
    ];

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
            
        }
    });

    return response.text
}


module.exports = generateCaption