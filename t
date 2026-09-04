[1mdiff --git a/server/utils/genai.ts b/server/utils/genai.ts[m
[1mindex 81c578a..2bddd64 100644[m
[1m--- a/server/utils/genai.ts[m
[1m+++ b/server/utils/genai.ts[m
[36m@@ -101,7 +101,7 @@[m [mexport async function generateAiText([m
     contents: prompt,[m
     config: {[m
       responseModalities: ["TEXT"],[m
[31m-      systemInstruction: `Devuelve únicamente el contenido solicitado, sin preámbulos, saludos, explicaciones ni comentarios finales. utiliza solo negritas y cursivas para enfatizar, sin encabezados, bullets points ni otros elementos visuales para los textos. ${systemInstruction}`,[m
[32m+[m[32m      systemInstruction: `Return only the requested content, without preambles, greetings, explanations, or closing remarks. Use only bold and italics for emphasis, without headings, bullet points, or other visual elements for text. ${systemInstruction}`,[m
     },[m
   });[m
   return {[m
