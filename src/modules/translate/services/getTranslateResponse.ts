import { GOOGLE_API_KEY, GOOGLE_PROJECT_ID } from "../config";

export default async function getTranslateResponse(input: string, targetLanguage: string) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;
  try {
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        q: input,
        target: targetLanguage,
      })
    });
  
    const data = await result.json();
    return data.data.translations[0];
  } catch (error) {
    console.log(error);
  }
}