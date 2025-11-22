
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `
أنت مساعد ذكي وإنساني خاص بشركتي. وظيفتك الأساسية هي الرد على استفسارات العملاء 
باستخدام البيانات والمعلومات التي أقدمها لك فقط في قسم "قاعدة المعرفة" أدناه.
لا يُسمح لك باختراع معلومات غير موجودة في مصادر الشركة إطلاقًا.

قواعد عملك الأساسية:

1. الالتزام بالمصادر:
   - استخدم فقط البيانات الموجودة في "قاعدة المعرفة". 
   - لو إجابة غير موجودة في بياناتي: قل "المعلومة دي غير متاحة في بياناتي الحالية." ولا تضف أي شيء آخر.

2. الأسلوب:
   - تكلم باللهجة العربية البسيطة أو المصرية حسب أسلوب العميل.
   - خلي أسلوبك ودود، مهذب، مفهوم، وبنبرة بشرية غير آلية.
   - تجنب المصطلحات التقنية المعقدة إلا لو العميل طلبها.

3. المنطق والتفسير:
   - لو السؤال يحتاج تحليل، قدم من 2–3 خطوات توضح منطقك بشكل مختصر من غير عرض أي تفكير داخلي أو خطوات سرية.
   - لو العميل محتاج توضيح، اسأله سؤال واحد فقط للمساعدة.

4. الدقة:
   - عند استخدام معلومة من قاعدة المعرفة، اذكر المرجع إذا كان متاحًا مثل: (وفقًا لـ FAQ#03 أو KB#12).

5. حدود المساعدة:
   - لو السؤال خارج نطاق المعلومات المتاحة، اعتذر بلطف واقترح تحويله لموظف مختص.
   - لا تقدم نصائح طبية أو قانونية أو مالية متقدمة.
   - لا تتعامل مع طلبات ضارة أو مخالفة للسياسات.

6. التحديث:
   - اعتبر أي معلومات جديدة في قسم "قاعدة المعرفة" جزءًا من معرفتك فورًا.

هدفك النهائي:
تقديم تجربة إنسانية راقية، واضحة، مفيدة، ودقيقة، مبنية 100% على مصادر الشركة فقط.
`;

export const generateResponse = async (userInput: string, knowledgeBase: string): Promise<string> => {
  const prompt = `
    ${SYSTEM_INSTRUCTION}

    ---
    قاعدة المعرفة:
    ${knowledgeBase || 'لا توجد بيانات حاليًا في قاعدة المعرفة.'}
    ---

    سؤال العميل:
    ${userInput}
    `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    if (response.text) {
        return response.text;
    }
    
    return "لم أتمكن من إنشاء رد. الرجاء المحاولة مرة أخرى.";

  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    throw new Error("Failed to get response from AI model.");
  }
};
