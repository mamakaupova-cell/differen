import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.NODE_ENV === 'production' && process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API: Generate differentiated task sets for teachers
app.post('/api/generate-task-set', async (req, res) => {
  try {
    const {
      grade = 7,
      topic = 'Қысқаша көбейту формулалары',
      taskType = 'БЖБ',
      countPerLevel = 2,
      language = 'kk',
      includeDescriptors = true,
      customNote = '',
    } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'Gemini API кілті орнатылмағандықтан жүйе ішкі базаны пайдаланады.',
      });
    }

    const systemPrompt = `Сіз Қазақстанның жалпы білім беретін мектептері мен Назарбаев Зияткерлік мектептерінің (НЗМ) математика пәні бойынша тәжірибелі әдіскер-мұғалімісіз.
Тапсырма: ${grade}-сынып математикасынан «${topic}» тақырыбы бойынша деңгейлік сараланған (A, B, C деңгейлері) интерактивті тапсырмалар жинағын құрастырыңыз.
Жинақ түрі: ${taskType}.
Әр деңгейге тапсырма саны: ${countPerLevel}.

Деңгейлік талаптар:
- А деңгейі (Базалық/Білу және түсіну): негізгі ұғымдар, анықтамалар, қарапайым формулаларды бір қадаммен қолдану, қарапайым есептеулер.
- В деңгейі (Орташа/Қолдану): стандартты алгоритмдер, бірнеше амалдық түрлендірулер, логикалық байланыстыру, теңдеулер құру.
- С деңгейі (Күрделі/Талдау және синтез): тереңдетілген ойлау, олимпиадалық немесе өмірлік контекстті есептер, параметрлік тапсырмалар, геометриялық/алгебралық дәлелдеу.

Әр тапсырмада нақты жауап (correctAnswer), 4 нұсқа (options: A, B, C, D), бағыттаушы көмек (hint), қадамдық шешім (solutionSteps) және мұғалімге арналған дескриптор (descriptor) болуы шарт. Барлық математикалық өрнектер түсінікті жазылсын. Жауап қазақ тілінде берілсін.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Төмендегі талаптар бойынша математикалық жинақ құрастырыңыз:
Сынып: ${grade}-сынып
Тақырып: ${topic}
Тапсырма түрі: ${taskType}
Әр деңгейдегі есептер саны: ${countPerLevel}
Қосымша нұсқаулық: ${customNote || 'Стандартты бағдарламаға сәйкес'}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Жинақтың атауы' },
            grade: { type: Type.INTEGER, description: 'Сынып' },
            topic: { type: Type.STRING, description: 'Тақырып' },
            learningObjective: { type: Type.STRING, description: 'Оқу мақсаты (мысалы: 7.1.2.14)' },
            assessmentCriteria: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Бағалау критерийлері' },
            totalPoints: { type: Type.INTEGER, description: 'Жалпы балл' },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  level: { type: Type.STRING, description: 'A, B немесе C' },
                  levelLabel: { type: Type.STRING, description: 'Базалық / Қолдану / Талдау' },
                  question: { type: Type.STRING, description: 'Есептің шарты' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '4 таңдау нұсқасы (A, B, C, D)',
                  },
                  correctAnswer: { type: Type.STRING, description: 'Дұрыс жауап' },
                  hint1: { type: Type.STRING, description: '1-ші бағыттаушы кеңес (формула)' },
                  hint2: { type: Type.STRING, description: '2-ші түсіндірмелі кеңес' },
                  solutionSteps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Қадамдық шешім',
                  },
                  descriptor: { type: Type.STRING, description: 'Оқушы жетістігінің дескрипторы' },
                  points: { type: Type.INTEGER, description: 'Берілетін балл (1-3)' },
                  visualType: {
                    type: Type.STRING,
                    description: 'none, geometry, graph, fraction, or coordinates',
                  },
                },
                required: ['id', 'level', 'question', 'options', 'correctAnswer', 'solutionSteps', 'descriptor', 'points'],
              },
            },
          },
          required: ['title', 'grade', 'topic', 'learningObjective', 'assessmentCriteria', 'tasks', 'totalPoints'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error generating tasks via Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Тапсырма генерациялау кезінде қате орын алды',
    });
  }
});

// API: Provide intelligent adaptive guidance for struggling students
app.post('/api/adaptive-hint', async (req, res) => {
  try {
    const { question, studentAnswer, correctAnswer, level, topic, grade, attemptCount } = req.body;

    if (!ai) {
      return res.json({
        hint: `Қайта тексеріңіз. ${topic} бойынша ережені еске түсіріңіз және әрбір амалды кезегімен орындаңыз.`,
      });
    }

    const prompt = `Оқушы ${grade}-сыныпта «${topic}» тақырыбы бойынша мынадай ${level} деңгейлі есепті шешуде:
Сұрақ: "${question}"
Оқушының қате жауабы: "${studentAnswer}"
Дұрыс жауап: "${correctAnswer}"
Бұл оқушының ${attemptCount}-ші қатесі.

Оқушыға қазақ тілінде қысқа (2-3 сөйлем), жылы әрі жігерлендіретін бағыттаушы көмек беріңіз. Тікелей дұрыс жауапты айтпаңыз, бірақ оқушы қай жерден қателесуі мүмкін екенін (мысалы, таңбадан, формуладан немесе бөлшектен) меңзеп, дұрыс шешуге қарай жетелеңіз.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Сіз мейірімді, қолдаушы математика пәнінің оқытушысысыз. Оқушыны мақтап, қатесін өзі түзеуге бағыттайсыз.',
      },
    });

    return res.json({
      hint: response.text?.trim() || 'Есептің шартына қайта назар аударыңыз.',
    });
  } catch (error: any) {
    console.error('Error getting adaptive hint:', error);
    return res.json({
      hint: 'Формуланы қайта тексеріп, амалдардың орындалу ретіне мән беріңіз.',
    });
  }
});

// API: Generate single real-time adaptive math question via Gemini AI
app.post('/api/generate-adaptive-task', async (req, res) => {
  try {
    const {
      grade = 7,
      topicTitle = 'Қысқаша көбейту формулалары',
      sectionCode = '7.3A',
      level = 'A',
      previousQuestions = [],
    } = req.body;

    if (!ai) {
      return res.json({ success: false, reason: 'no_api_key' });
    }

    const prompt = `Қазақстан мектеп бағдарламасы бойынша ${grade}-сынып математикасынан «${topicTitle}» (${sectionCode}) тақырыбына жаңа ${level} деңгейлі БІР ТАПСЫРМА құрастырыңыз.
Бұған дейінгі есептер қайталанбасын: ${JSON.stringify(previousQuestions.slice(-4))}.
Деңгей талабы:
- А: Базалық деңгей (1 балл) - анықтамалар, қарапайым формулалар мен есептеулер
- В: Қолдану деңгейі (2 балл) - стандартты алгоритмдер мен түрлендірулер
- С: Талдау және терең ойлау деңгейі (3 балл) - күрделірек логикалық тапсырмалар

Міндетті түрде 4 бірегей нұсқа (options), дәл дұрыс жауап (correctAnswer options ішінде болуы керек), 2 бағыттаушы кеңес (hint1, hint2), қадамдық шешу жолы (solutionSteps) және дескриптор беріңіз. Барлығы таза қазақ тілінде болсын.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Сіз мектеп математикасы бойынша тәжірибелі әдіскерсіз. Есептердің математикалық дұрыстығына және 4 нұсқаның біреуі ғана дұрыс болуына кепілдік беріңіз.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: 'Есептің шарты' },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: '4 таңдау нұсқасы' },
            correctAnswer: { type: Type.STRING, description: 'Дұрыс жауап' },
            hint1: { type: Type.STRING, description: '1-ші бағыттаушы кеңес (формула)' },
            hint2: { type: Type.STRING, description: '2-ші бағыттаушы кеңес' },
            solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Қадамдық шешім' },
            descriptor: { type: Type.STRING, description: 'Дескриптор' },
            points: { type: Type.INTEGER, description: 'Балл (1-3)' },
            visualType: { type: Type.STRING, description: 'none, geometry, graph, fraction, or coordinates' },
          },
          required: ['question', 'options', 'correctAnswer', 'hint1', 'hint2', 'solutionSteps', 'descriptor', 'points'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, task: parsed });
  } catch (err: any) {
    console.error('Error generating single adaptive task:', err);
    return res.json({ success: false, error: err.message });
  }
});

// Setup Vite middleware in dev or static files in prod
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI-Differentiation Server running at http://localhost:${PORT}`);
});
