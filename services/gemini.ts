
import { GoogleGenAI, Type } from "@google/genai";
import { Medication, Patient, DrugInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiPrescriptionAdvice = async (diagnosis: string, patient: Patient, drugs: Medication[]) => {
  const prompt = `
    As a medical expert assistant, review this digital prescription:
    Diagnosis: ${diagnosis}
    Patient Profile: ${patient.age} years old, Allergies: ${patient.allergies.join(", ")}, History: ${patient.medicalHistory.join(", ")}
    Current Medications: ${drugs.map(d => `${d.name} (${d.genericName}) ${d.dosage}`).join(", ")}
    
    Tasks:
    1. Check for drug interactions.
    2. Check for allergy contraindications.
    3. Verify if doses seem standard for the age.
    4. Suggest potential alternatives if risky.
    
    Return a professional summary in Persian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "خطا در برقراری ارتباط با هوش مصنوعی.";
  }
};

export const parseVoicePrescription = async (transcript: string) => {
  const prompt = `
    Parse the following spoken medical prescription into a structured JSON list of medications.
    Transcript: "${transcript}"
    
    The JSON should be an array of objects with: name, genericName, dosage, frequency, duration, instructions.
    Language of input might be Persian or English. Extract details accurately.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              genericName: { type: Type.STRING },
              dosage: { type: Type.STRING },
              frequency: { type: Type.STRING },
              duration: { type: Type.STRING },
              instructions: { type: Type.STRING },
            },
            required: ["name", "dosage", "frequency"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Voice Parse Error:", error);
    return [];
  }
};
