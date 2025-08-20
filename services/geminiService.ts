
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const KASHMIRI_SYSTEM_INSTRUCTION = "You are a friendly and helpful assistant who is an expert in the Kashmiri language (Koshur). Your primary goal is to communicate exclusively in Kashmiri. Do not use English or any other language in your responses, unless the user specifically asks for a translation. Maintain a warm and respectful tone in all conversations.";

const TRANSLATE_FOR_SPEECH_SYSTEM_INSTRUCTION = "You are an expert linguist. Convert the given Kashmiri text into a phonetically equivalent Hindi text using Devanagari script. The goal is to create a version that a Hindi text-to-speech engine can pronounce to sound like authentic Kashmiri. This is for pronunciation, not literal meaning. Output only the Hindi text.";

export const createKashmiriChat = (): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: KASHMIRI_SYSTEM_INSTRUCTION,
      temperature: 0.8,
      topP: 0.9,
    }
  });
  return chat;
};

export const translateKashmiriToHindiForSpeech = async (text: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Convert the following Kashmiri text for Hindi text-to-speech: "${text}"`,
      config: {
          systemInstruction: TRANSLATE_FOR_SPEECH_SYSTEM_INSTRUCTION,
          temperature: 0.1
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error translating for speech:', error);
    // Fallback to original text if translation fails
    return text;
  }
};