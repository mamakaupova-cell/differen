import { GradeLevel, MathTask, TaskLevel, TopicItem } from '../types/math';

// Helper: random integer in [min, max] inclusive
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: random element from array
function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: shuffle array
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Procedurally generates an infinite series of unique, mathematically verified
 * differentiated tasks (Level A, B, C) matching the Kazakhstani 5-9 grade curriculum.
 * Each topic and level features multiple randomized problem archetypes.
 */
export function generateProceduralTask(
  topic: TopicItem,
  level: TaskLevel,
  grade: GradeLevel,
  avoidQuestion?: string,
  variantSeed?: number
): MathTask {
  // Try up to 8 iterations to produce a task that doesn't match avoidQuestion
  for (let attempt = 0; attempt < 8; attempt++) {
    const task = internalGenerateProceduralTask(topic, level, grade, (variantSeed ?? 0) + attempt);
    if (!avoidQuestion || task.question !== avoidQuestion) {
      return task;
    }
  }
  // Fallback with guaranteed unique timestamp offset
  return internalGenerateProceduralTask(topic, level, grade, (variantSeed ?? 0) + randInt(50, 999));
}

function internalGenerateProceduralTask(
  topic: TopicItem,
  level: TaskLevel,
  grade: GradeLevel,
  seed: number
): MathTask {
  const code = (topic.sectionCode || '').toUpperCase();
  const rawTitle = (topic.title || '').toLowerCase();
  const rawId = (topic.id || '').toLowerCase();
  const uniqueId = `proc-${topic.id}-${level}-${Date.now()}-${seed}-${randInt(10, 99)}`;
  const archetype = (seed + randInt(0, 5)) % 4;

  // ========================================================
  // 1. POWERS & EXPONENTS (7.1A, 8.1A, дәреже, көрсеткіш)
  // ========================================================
  if (
    code.includes('7.1А') ||
    code.includes('7.1A') ||
    (rawTitle.includes('дәреже') && !rawTitle.includes('көпмүше')) ||
    rawTitle.includes('көрсеткіш') ||
    rawId.includes('power')
  ) {
    const vars = ['a', 'x', 'y', 'm', 'b', 'c', 'p', 'k'];
    const v = pickOne(vars);

    if (level === 'A') {
      if (archetype % 2 === 0) {
        const p1 = randInt(3, 12);
        const p2 = randInt(2, 9);
        const p3 = randInt(1, Math.min(p1 + p2 - 1, 7));
        const resExp = p1 + p2 - p3;
        const q = `Өрнекті ықшамдаңыз: ${v}^${p1} * ${v}^${p2} : ${v}^${p3} = ?`;
        const correct = `${v}^${resExp}`;
        const opts = shuffle([correct, `${v}^${resExp + 2}`, `${v}^${Math.max(1, resExp - 2)}`, `${v}^${p1 + p2 + p3}`]);
        return {
          id: uniqueId,
          grade,
          subject: topic.subject,
          quarter: topic.quarter,
          sectionCode: topic.sectionCode,
          topicId: topic.id,
          topicTitle: topic.title,
          level: 'A',
          levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
          learningObjective: 'Бірдей негізді дәрежелерді көбейту және бөлу қасиеттері',
          question: q,
          options: opts,
          correctAnswer: correct,
          hint1: 'Бірдей негіздерді көбейткенде көрсеткіштер қосылады, бөлгенде азайтылады.',
          hint2: `${v}^(${p1} + ${p2} - ${p3}) = ${v}^${resExp}.`,
          solutionSteps: [`1-қадам: ${v}^${p1} * ${v}^${p2} = ${v}^(${p1}+${p2}) = ${v}^${p1 + p2}`, `2-қадам: ${v}^${p1 + p2} : ${v}^${p3} = ${v}^(${p1 + p2}-${p3}) = ${v}^${resExp}`],
          descriptor: 'Дәрежелердің негізгі қасиеттерін қолданып өрнекті ықшамдайды.',
          points: 1,
        };
      } else {
        const b = randInt(2, 5);
        const p = randInt(2, 4);
        const val = Math.pow(b, p);
        const q = `Санның дәрежесінің мәнін табыңыз: ${b}^${p} = ?`;
        const correct = `${val}`;
        const opts = shuffle([correct, `${val + b}`, `${Math.max(1, val - b)}`, `${b * p}`]);
        return {
          id: uniqueId,
          grade,
          subject: topic.subject,
          quarter: topic.quarter,
          sectionCode: topic.sectionCode,
          topicId: topic.id,
          topicTitle: topic.title,
          level: 'A',
          levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
          learningObjective: 'Натурал көрсеткішті дәреже мәні',
          question: q,
          options: opts,
          correctAnswer: correct,
          hint1: `${b}^${p} дегеніміз ${b} санын өзіне-өзін ${p} рет көбейту.`,
          hint2: `${b} * ... (${p} рет) = ${val}.`,
          solutionSteps: [`1-қадам: ${b}^${p} = ${val}`],
          descriptor: 'Санның дәрежесін есептейді.',
          points: 1,
        };
      }
    } else if (level === 'B') {
      const exp1 = randInt(2, 6);
      const exp2 = randInt(2, 5);
      const mult = randInt(2, 7);
      const totalExp = exp1 * exp2;
      const q = `Дәрежені дәрежеге шығарып, мәнін ықшамдаңыз: (${v}^${exp1})^${exp2} * ${v}^${mult} = ?`;
      const correct = `${v}^${totalExp + mult}`;
      const opts = shuffle([correct, `${v}^${totalExp}`, `${v}^${exp1 + exp2 + mult}`, `${v}^${(totalExp + mult) * 2}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Дәрежені дәрежеге шығару және көбейту',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Дәрежені дәрежеге шығарғанда көрсеткіштер өзара көбейтіледі: (a^n)^m = a^(n*m).',
        hint2: `(${v}^${exp1})^${exp2} = ${v}^${totalExp}, сосын ${v}^${totalExp} * ${v}^${mult} = ${v}^${totalExp + mult}.`,
        solutionSteps: [`1-қадам: (${v}^${exp1})^${exp2} = ${v}^(${exp1}*${exp2}) = ${v}^${totalExp}`, `2-қадам: ${v}^${totalExp} * ${v}^${mult} = ${v}^${totalExp + mult}`],
        descriptor: 'Дәрежені дәрежеге шығару ережесін қатесіз қолданады.',
        points: 2,
      };
    } else {
      const base = randInt(2, 6);
      const negExp = randInt(1, 4);
      const diff = randInt(1, 3);
      const posExp = negExp + diff;
      const resVal = Math.pow(base, diff);
      const q = `Өрнектің мәнін табыңыз: (${base}^-${negExp} * ${base}^${posExp}) : ${base}^0 = ?`;
      const correct = `${resVal}`;
      const opts = shuffle([correct, `${resVal * base}`, `${Math.max(1, Math.round(resVal / base))}`, `${resVal + base}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Бүтін теріс және нөлдік көрсеткішті дәреже мәні',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Кез келген санның нөлдік дәрежесі 1-ге тең (a^0 = 1). Ал a^(-n) * a^m = a^(m - n).',
        hint2: `${base}^(-${negExp} + ${posExp}) = ${base}^${diff} = ${resVal}.`,
        solutionSteps: [`1-қадам: ${base}^-${negExp} * ${base}^${posExp} = ${base}^(${posExp}-${negExp}) = ${base}^${diff}`, `2-қадам: ${base}^0 = 1`, `3-қадам: ${resVal} : 1 = ${resVal}`],
        descriptor: 'Теріс және нөлдік дәрежелердің мәнін есептейді.',
        points: 3,
      };
    }
  }

  // ========================================================
  // 2. POLYNOMIALS (7.1В, 7.1B, көпмүше, бірмүше)
  // ========================================================
  if (
    code.includes('7.1В') ||
    code.includes('7.1B') ||
    rawTitle.includes('көпмүше') ||
    rawTitle.includes('бірмүше') ||
    rawId.includes('polynomial')
  ) {
    if (level === 'A') {
      const k = randInt(2, 8);
      const a = randInt(2, 6);
      const b = randInt(3, 9);
      const c = randInt(2, 8);
      const q = `Көбейтуді орындаңыз: ${k}x(${a}x² - ${b}x + ${c})`;
      const correct = `${k * a}x³ - ${k * b}x² + ${k * c}x`;
      const opts = shuffle([
        correct,
        `${k * a}x² - ${k * b}x + ${k * c}`,
        `${k * a}x³ + ${k * b}x² - ${k * c}x`,
        `${k + a}x³ - ${k + b}x² + ${c}x`,
      ]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Бірмүшені көпмүшеге көбейту',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Бірмүшені жақша ішіндегі әрбір қосылғышқа үлестірімділік заңымен кезекпен көбейтіңіз.',
        hint2: `${k}x * ${a}x² = ${k * a}x³,  ${k}x * (-${b}x) = -${k * b}x²,  ${k}x * ${c} = ${k * c}x.`,
        solutionSteps: [`1-қадам: ${k}x * ${a}x^2 = ${k * a}x^3`, `2-қадам: ${k}x * (-${b}x) = -${k * b}x^2`, `3-қадам: ${k}x * ${c} = ${k * c}x`],
        descriptor: 'Бірмүшені көпмүшеге көбейту ережесін қолданады.',
        points: 1,
      };
    } else if (level === 'B') {
      const a = randInt(2, 6);
      const b = randInt(1, 7);
      const c = randInt(2, 7);
      const middleCoeff = a * c - b;
      const constTerm = b * c;
      const q = `Көпмүшелерді көбейтіп ұқсас мүшелерін біріктіріңіз: (${a}x - ${b})(x + ${c})`;
      const signMiddle = middleCoeff >= 0 ? `+ ${middleCoeff}x` : `- ${Math.abs(middleCoeff)}x`;
      const correct = `${a}x² ${signMiddle} - ${constTerm}`;
      const opts = shuffle([
        correct,
        `${a}x² + ${middleCoeff + 2}x - ${constTerm}`,
        `${a}x² - ${middleCoeff}x + ${constTerm}`,
        `${a}x² - ${constTerm}`,
      ]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Көпмүшені көпмүшеге көбейту',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Әрбір мүшені екінші жақшаның әрбір мүшесіне көбейтіп, ұқсас мүшелерді қосыңыз.',
        hint2: `${a}x*x + ${a}x*${c} - ${b}*x - ${b}*${c} = ${a}x² + (${a * c} - ${b})x - ${constTerm}.`,
        solutionSteps: [`1-қадам: ${a}x*x + ${a}x*${c} - ${b}*x - ${b}*${c}`, `2-қадам: ${a}x^2 + ${a * c}x - ${b}x - ${constTerm}`, `3-қадам: ${correct}`],
        descriptor: 'Көпмүшені көпмүшеге көбейтіп ықшамдайды.',
        points: 2,
      };
    } else {
      const coeff = randInt(2, 9);
      const v1 = pickOne(['a', 'm', 'p', 'u']);
      const v2 = pickOne(['b', 'n', 'q', 'v']);
      const q = `Көпмүшені топтау тәсілімен көбейткіштерге жіктеңіз: ${v1}x + ${v1}y - ${v2}x - ${v2}y + ${coeff}x + ${coeff}y`;
      const correct = `(x + y)(${v1} - ${v2} + ${coeff})`;
      const opts = shuffle([
        correct,
        `(x - y)(${v1} + ${v2} + ${coeff})`,
        `(x + y)(${v1} + ${v2} - ${coeff})`,
        `(x - y)(${v1} - ${v2} - ${coeff})`,
      ]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Көпмүшені топтау әдісімен көбейткіштерге жіктеу',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Жұптар бойынша (x + y) ортақ жақшасын топтап шығарыңыз.',
        hint2: `${v1}(x + y) - ${v2}(x + y) + ${coeff}(x + y) = (x + y)(${v1} - ${v2} + ${coeff}).`,
        solutionSteps: [`1-қадам: ${v1}(x+y) - ${v2}(x+y) + ${coeff}(x+y)`, `2-қадам: Ортақ жақшаны шығару: (x + y)(${v1} - ${v2} + ${coeff})`],
        descriptor: 'Көпмүшені топтау тәсілімен көбейткіштерге жіктейді.',
        points: 3,
      };
    }
  }

  // ========================================================
  // 3. GEOMETRY: ANGLES & INTERSECTIONS (7.1G, сыбайлас, вертикаль)
  // ========================================================
  if (
    code.includes('7.1G') ||
    rawTitle.includes('сыбайлас') ||
    rawTitle.includes('вертикаль') ||
    rawId.includes('geometry-intro') ||
    (rawTitle.includes('бұрыш') && !rawTitle.includes('үшбұрыш') && !rawTitle.includes('көпбұрыш') && !rawTitle.includes('төртбұрыш'))
  ) {
    if (level === 'A') {
      const angle1 = randInt(25, 155);
      const angle2 = 180 - angle1;
      const q = `Сыбайлас екі бұрыштың бірі ${angle1}° болса, оның екінші сыбайлас бұрышын табыңыз:`;
      const correct = `${angle2}°`;
      const opts = shuffle([correct, `${angle2 + 10}°`, `${Math.max(10, angle2 - 10)}°`, `${180 - angle2 + 5}°`]);
      return {
        id: uniqueId,
        grade,
        subject: 'Геометрия',
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Сыбайлас бұрыштардың қасиеті',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Сыбайлас бұрыштардың қосындысы әрқашан 180°-қа тең.',
        hint2: `180° - ${angle1}° = ${angle2}°.`,
        solutionSteps: [`1-қадам: Сыбайлас бұрыштар қосындысы: α + β = 180°`, `2-қадам: β = 180° - ${angle1}° = ${angle2}°`],
        descriptor: 'Сыбайлас бұрыштардың қосындысы 180° болатынын біледі және қолданады.',
        points: 1,
        visualData: { type: 'angle', title: `Бұрыштар: ${angle1}° және ${angle2}°` },
      };
    } else if (level === 'B') {
      const diff = randInt(12, 70);
      const evenDiff = diff % 2 === 0 ? diff : diff + 1;
      const smallAngle = (180 - evenDiff) / 2;
      const bigAngle = smallAngle + evenDiff;
      const q = `Сыбайлас екі бұрыштың бірі екіншісінен ${evenDiff}° артық. Осы бұрыштардың үлкенін табыңыз:`;
      const correct = `${bigAngle}°`;
      const opts = shuffle([correct, `${smallAngle}°`, `${bigAngle + 10}°`, `${smallAngle + 5}°`]);
      return {
        id: uniqueId,
        grade,
        subject: 'Геометрия',
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Сыбайлас бұрыштарға теңдеу құру',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `Кіші бұрышты x деп алсақ, үлкені (x + ${evenDiff})° болады. x + (x + ${evenDiff}) = 180°.`,
        hint2: `2x = ${180 - evenDiff} => x = ${smallAngle}°. Үлкені = ${bigAngle}°.`,
        solutionSteps: [`1-қадам: x + (x + ${evenDiff}) = 180°`, `2-қадам: 2x = ${180 - evenDiff} => x = ${smallAngle}°`, `3-қадам: Үлкен бұрыш = ${bigAngle}°`],
        descriptor: 'Сыбайлас бұрыштарға байланысты сызықтық теңдеу құрып шешеді.',
        points: 2,
      };
    } else {
      const vert = randInt(25, 85);
      const q = `Екі түзу қиылысқанда пайда болатын екі вертикаль бұрыштың қосындысы ${vert * 2}° болса, осы бұрыштармен сыбайлас бұрыштың шамасын табыңыз:`;
      const correct = `${180 - vert}°`;
      const opts = shuffle([correct, `${vert}°`, `${vert * 2}°`, `${180 - vert * 2}°`]);
      return {
        id: uniqueId,
        grade,
        subject: 'Геометрия',
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Вертикаль және сыбайлас бұрыштардың байланысы',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `Вертикаль бұрыштар өзара тең. Әрқайсысы ${vert * 2}° / 2 = ${vert}° болады.`,
        hint2: `Сыбайлас бұрыш = 180° - ${vert}° = ${180 - vert}°.`,
        solutionSteps: [`1-қадам: Вертикаль бұрыштар тең: α = ${vert * 2}° / 2 = ${vert}°`, `2-қадам: Сыбайлас бұрыш = 180° - ${vert}° = ${180 - vert}°`],
        descriptor: 'Вертикаль және сыбайлас бұрыштар қасиеттерін біріктіріп қолданады.',
        points: 3,
      };
    }
  }

  // ========================================================
  // 4. SHORT MULTIPLICATION FORMULAS (7.3А, 7.3A, қысқаша көбейту)
  // ========================================================
  if (
    code.includes('7.3А') ||
    code.includes('7.3A') ||
    rawTitle.includes('қысқаша') ||
    rawTitle.includes('көбейту формула') ||
    rawId.includes('short-mult')
  ) {
    if (level === 'A') {
      const b = randInt(2, 15);
      const v = pickOne(['x', 'a', 'y', 'm']);
      const q = `Қысқаша көбейту формуласы бойынша жақшаны ашыңыз: (${v} + ${b})² = ?`;
      const correct = `${v}² + ${2 * b}${v} + ${b * b}`;
      const opts = shuffle([
        correct,
        `${v}² + ${b * b}`,
        `${v}² + ${b}${v} + ${b * b}`,
        `${v}² + ${2 * b}${v} + ${2 * b}`,
      ]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Екі өрнектің қосындысының квадраты',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: '(a + b)² = a² + 2ab + b² формуласын қолданыңыз.',
        hint2: `${v}² + 2*${b}*${v} + ${b}² = ${v}² + ${2 * b}${v} + ${b * b}.`,
        solutionSteps: [`1-қадам: (${v} + ${b})^2 = ${v}^2 + 2*${v}*${b} + ${b}^2`, `2-қадам: ${v}^2 + ${2 * b}${v} + ${b * b}`],
        descriptor: 'Екі өрнектің қосындысының квадраты формуласын дұрыс қолданады.',
        points: 1,
      };
    } else if (level === 'B') {
      const a = randInt(2, 9);
      const b = randInt(3, 14);
      const q = `Көбейткіштерге жіктеңіз: ${a * a}x² - ${b * b} = ?`;
      const correct = `(${a}x - ${b})(${a}x + ${b})`;
      const opts = shuffle([
        correct,
        `(${a}x - ${b})²`,
        `(${a * a}x - ${b})(${a}x + ${b})`,
        `(${a}x + ${b})²`,
      ]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Квадраттар айырымының формуласы',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'a² - b² = (a - b)(a + b) формуласын пайдаланыңыз.',
        hint2: `(${a}x)² - ${b}² = (${a}x - ${b})(${a}x + ${b}).`,
        solutionSteps: [`1-қадам: ${a * a}x^2 = (${a}x)^2, ${b * b} = ${b}^2`, `2-қадам: (${a}x - ${b})(${a}x + ${b})`],
        descriptor: 'Квадраттар айырымы формуласымен көбейткіштерге жіктейді.',
        points: 2,
      };
    } else {
      const n1 = randInt(31, 99);
      const n2 = n1 - randInt(1, 5);
      const res = (n1 - n2) * (n1 + n2);
      const q = `Тиімді тәсілмен есептеңіз: ${n1}² - ${n2}² = ?`;
      const correct = `${res}`;
      const opts = shuffle([correct, `${res + (n1 - n2)}`, `${res - (n1 - n2)}`, `${(n1 + n2) * 2}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Квадраттар айырымын есептеулерде тиімді қолдану',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `a² - b² = (a - b)(a + b). Мұнда (a - b) = ${n1 - n2}.`,
        hint2: `(${n1} - ${n2})(${n1} + ${n2}) = ${n1 - n2} * ${n1 + n2} = ${res}.`,
        solutionSteps: [`1-қадам: (${n1} - ${n2}) * (${n1} + ${n2})`, `2-қадам: ${n1 - n2} * ${n1 + n2} = ${res}`],
        descriptor: 'Қысқаша көбейту формулаларын қолданып ауызша тиімді есептейді.',
        points: 3,
      };
    }
  }

  // ========================================================
  // 5. LINEAR FUNCTIONS & GRAPHS (7.3В, 7.3B, сызықтық функция)
  // ========================================================
  if (
    code.includes('7.3В') ||
    code.includes('7.3B') ||
    rawTitle.includes('сызықтық функция') ||
    (rawTitle.includes('функция') && !rawTitle.includes('квадраттық')) ||
    rawId.includes('function')
  ) {
    const k = randInt(2, 10);
    const b = randInt(1, 20);
    const x0 = randInt(1, 9);
    const y0 = k * x0 + b;

    if (level === 'A') {
      const q = `y = ${k}x + ${b} сызықтық функциясы берілген. Егер x = ${x0} болса, y-тің мәнін табыңыз:`;
      const correct = `${y0}`;
      const opts = shuffle([correct, `${y0 + k}`, `${Math.max(1, y0 - 2)}`, `${k * x0}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Функцияның нүктедегі мәні',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `Функция формуласындағы x-тің орнына ${x0} мәнін қойып есептеңіз.`,
        hint2: `y = ${k} * ${x0} + ${b} = ${y0}.`,
        solutionSteps: [`1-қадам: y = ${k} * ${x0} + ${b}`, `2-қадам: y = ${k * x0} + ${b} = ${y0}`],
        descriptor: 'Аргументтің берілген мәні бойынша функция мәнін табады.',
        points: 1,
        visualData: { type: 'linear_graph', title: `y = ${k}x + ${b}` },
      };
    } else if (level === 'B') {
      if (archetype % 2 === 0) {
        const rootX = randInt(2, 12);
        const bVal = k * rootX;
        const q = `y = ${k}x - ${bVal} функциясының графигі абсциссалар (Ox) осін қандай нүктеде қиып өтеді?`;
        const correct = `(${rootX}; 0)`;
        const opts = shuffle([correct, `(0; -${bVal})`, `(-${rootX}; 0)`, `(${rootX + 1}; 0)`]);
        return {
          id: uniqueId,
          grade,
          subject: topic.subject,
          quarter: topic.quarter,
          sectionCode: topic.sectionCode,
          topicId: topic.id,
          topicTitle: topic.title,
          level: 'B',
          levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
          learningObjective: 'Графиктің Ox осімен қиылысу нүктесі',
          question: q,
          options: opts,
          correctAnswer: correct,
          hint1: `Ox осімен қиылысу нүктесінде y = 0 болады. 0 = ${k}x - ${bVal} теңдеуін шешіңіз.`,
          hint2: `${k}x = ${bVal} => x = ${rootX}. Нүкте: (${rootX}; 0).`,
          solutionSteps: [`1-қадам: y = 0 деп аламыз: ${k}x - ${bVal} = 0`, `2-қадам: ${k}x = ${bVal} => x = ${rootX}`, `3-қадам: Қиылысу нүктесі: (${rootX}; 0)`],
          descriptor: 'Сызықтық функция графигінің координата остерімен қиылысу нүктесін табады.',
          points: 2,
        };
      } else {
        const q = `y = ${k}x + ${b} функциясының графигі ординаталар (Oy) осін қандай нүктеде қиып өтеді?`;
        const correct = `(0; ${b})`;
        const opts = shuffle([correct, `(${b}; 0)`, `(0; -${b})`, `(1; ${k + b})`]);
        return {
          id: uniqueId,
          grade,
          subject: topic.subject,
          quarter: topic.quarter,
          sectionCode: topic.sectionCode,
          topicId: topic.id,
          topicTitle: topic.title,
          level: 'B',
          levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
          learningObjective: 'Графиктің Oy осімен қиылысу нүктесі',
          question: q,
          options: opts,
          correctAnswer: correct,
          hint1: `Oy осімен қиылысу нүктесінде x = 0 болады. y = ${k}*0 + ${b}.`,
          hint2: `y = ${b}. Нүкте: (0; ${b}).`,
          solutionSteps: [`1-қадам: x = 0 мәнін қоямыз: y = ${k}*0 + ${b}`, `2-қадам: y = ${b} => нүкте (0; ${b})`],
          descriptor: 'Ордината осімен қиылысу нүктесін анықтайды.',
          points: 2,
        };
      }
    } else {
      const targetPointX = randInt(1, 6);
      const targetPointY = randInt(2, 12);
      const cConst = targetPointY - k * targetPointX;
      const cSign = cConst >= 0 ? `+ ${cConst}` : `- ${Math.abs(cConst)}`;
      const q = `y = ${k}x + ${b} түзуіне параллель және (${targetPointX}; ${targetPointY}) нүктесінен өтетін түзудің теңдеуін табыңыз:`;
      const correct = `y = ${k}x ${cSign}`;
      const opts = shuffle([
        correct,
        `y = -${k}x ${cSign}`,
        `y = ${k}x + ${b}`,
        `y = ${targetPointX}x + ${targetPointY}`,
      ]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Параллель түзулердің бұрыштық коэффициенттері',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `Параллель түзулердің k коэффициенттері тең (k = ${k}). Түзу теңдеуіне (${targetPointX}; ${targetPointY}) нүктесін қойып, бос мүшені табыңыз.`,
        hint2: `${targetPointY} = ${k}*${targetPointX} + c => c = ${cConst}.`,
        solutionSteps: [`1-қадам: Параллельдік шарты: k = ${k}`, `2-қадам: ${targetPointY} = ${k} * ${targetPointX} + c => c = ${cConst}`, `3-қадам: Теңдеу: y = ${k}x ${cSign}`],
        descriptor: 'Түзулердің өзара орналасу шартын талдап жаңа функция теңдеуін құрады.',
        points: 3,
      };
    }
  }

  // ========================================================
  // 6. LINEAR EQUATIONS & BASIC ALGEBRA (5.1A, 6.3A, 7.4A)
  // ========================================================
  if (
    code.includes('5.1А') ||
    code.includes('6.3А') ||
    code.includes('7.4А') ||
    rawTitle.includes('сызықтық теңдеу') ||
    rawTitle.includes('теңдеулер') ||
    rawId.includes('equation')
  ) {
    if (level === 'A') {
      const a = randInt(15, 120);
      const x = randInt(10, 110);
      const sum = a + x;
      const q = `Теңдеуді шешіңіз: x + ${a} = ${sum}`;
      const correct = `x = ${x}`;
      const opts = shuffle([correct, `x = ${x + randInt(2, 6)}`, `x = ${Math.max(1, x - randInt(2, 6))}`, `x = ${sum + a}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Қарапайым сызықтық теңдеуді шешу',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Белгісіз қосылғышты табу үшін қосындыдан белгілі қосылғышты азайтыңыз.',
        hint2: `x = ${sum} - ${a} = ${x}.`,
        solutionSteps: [`1-қадам: x = ${sum} - ${a}`, `2-қадам: x = ${x}`],
        descriptor: 'Қарапайым сызықтық теңдеуді шешіп түбірін табады.',
        points: 1,
      };
    } else if (level === 'B') {
      const k = randInt(3, 10);
      const b = randInt(4, 30);
      const x = randInt(4, 20);
      const rhs = k * x - b;
      const q = `Теңдеуді шешіңіз: ${k}x - ${b} = ${rhs}`;
      const correct = `x = ${x}`;
      const opts = shuffle([correct, `x = ${x + 1}`, `x = ${Math.max(1, x - 1)}`, `x = ${x + 2}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Екі амалды сызықтық теңдеу',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `${b} санын оң жаққа таңбасын өзгертіп көшіріңіз.`,
        hint2: `${k}x = ${rhs + b} => x = ${rhs + b} / ${k} = ${x}.`,
        solutionSteps: [`1-қадам: ${k}x = ${rhs} + ${b} = ${rhs + b}`, `2-қадам: x = ${rhs + b} / ${k} = ${x}`],
        descriptor: 'Екі амалды сызықтық теңдеуді қатесіз шешеді.',
        points: 2,
      };
    } else {
      const k1 = randInt(4, 12);
      const k2 = randInt(2, k1 - 1);
      const x = randInt(3, 15);
      const c = randInt(5, 40);
      const diffCoeff = k1 - k2;
      const rhs = diffCoeff * x;
      const q = `Жақшаны ашып теңдеуді шешіңіз: ${k1}x - (${k2}x + ${c}) = ${rhs - c}`;
      const correct = `x = ${x}`;
      const opts = shuffle([correct, `x = ${x + 2}`, `x = ${Math.max(1, x - 1)}`, `x = ${x + 3}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Жақшалары бар сызықтық теңдеу',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Жақша алдында минус тұрғандықтан, таңбаларды қарама-қарсыға өзгертіп жақшаны ашыңыз.',
        hint2: `${k1}x - ${k2}x - ${c} = ${rhs - c} => ${diffCoeff}x = ${rhs} => x = ${x}.`,
        solutionSteps: [`1-қадам: ${k1}x - ${k2}x - ${c} = ${rhs - c}`, `2-қадам: ${diffCoeff}x = ${rhs}`, `3-қадам: x = ${x}`],
        descriptor: 'Көпмүшелік түрлендірулері бар күрделі теңдеуді шешеді.',
        points: 3,
      };
    }
  }

  // ========================================================
  // 7. FRACTIONS & DECIMALS (5.1C, 5.2A, 5.3B, бөлшек)
  // ========================================================
  if (
    code.includes('5.1С') ||
    code.includes('5.2А') ||
    code.includes('5.3В') ||
    rawTitle.includes('бөлшек') ||
    rawId.includes('fraction') ||
    rawId.includes('decimal')
  ) {
    if (level === 'A') {
      const den = randInt(6, 25);
      const num1 = randInt(1, den - 3);
      const num2 = randInt(1, den - num1);
      const sum = num1 + num2;
      const q = `Бөлімдері бірдей бөлшектерді қосыңыз: ${num1}/${den} + ${num2}/${den} = ?`;
      const correct = `${sum}/${den}`;
      const opts = shuffle([correct, `${sum}/${den * 2}`, `${Math.abs(num1 - num2)}/${den}`, `${sum + 1}/${den}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Бөлімдері бірдей бөлшектерді қосу',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Бөлімдері бірдей бөлшектерді қосқанда, алымдарын қосып, бөлімін өзгеріссіз қалдырамыз.',
        hint2: `(${num1} + ${num2}) / ${den} = ${sum}/${den}.`,
        solutionSteps: [`1-қадам: (${num1} + ${num2}) / ${den}`, `2-қадам: ${sum}/${den}`],
        descriptor: 'Бөлімдері бірдей жай бөлшектерді қосады.',
        points: 1,
      };
    } else if (level === 'B') {
      const n1 = randInt(2, 7);
      const d1 = randInt(3, 9);
      const n2 = randInt(1, 6);
      const d2 = randInt(2, 8);
      const num = n1 * n2;
      const den = d1 * d2;
      const q = `Бөлшектерді көбейтіңіз: (${n1}/${d1}) * (${n2}/${d2}) = ?`;
      const correct = `${num}/${den}`;
      const opts = shuffle([correct, `${num}/${d1 + d2}`, `${n1 + n2}/${den}`, `${num + 1}/${den}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Жай бөлшектерді көбейту',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Алымын алымына, бөлімін бөліміне көбейтіңіз.',
        hint2: `(${n1} * ${n2}) / (${d1} * ${d2}) = ${num}/${den}.`,
        solutionSteps: [`1-қадам: ${n1} * ${n2} = ${num}`, `2-қадам: ${d1} * ${d2} = ${den} => ${num}/${den}`],
        descriptor: 'Жай бөлшектерді көбейту алгоритмін орындайды.',
        points: 2,
      };
    } else {
      const total = randInt(6, 35) * 10;
      const partNum = pickOne([2, 3, 4]);
      const partDen = 5;
      const partVal = (total * partNum) / partDen;
      const rem = total - partVal;
      const q = `Кітапта барлығы ${total} бет бар. Оқушы кітаптың ${partNum}/${partDen} бөлігін оқыды. Оқушыға тағы неше бет оқу қалды?`;
      const correct = `${rem} бет`;
      const opts = shuffle([correct, `${partVal} бет`, `${rem + 10} бет`, `${Math.max(5, rem - 5)} бет`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Санның бөлігін табуға мәтінді есептер',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `Алдымен оқылған беттерді табу: барлық беттерді ${partNum}/${partDen}-ге көбейтіңіз.`,
        hint2: `${total} - ${partVal} = ${rem} бет.`,
        solutionSteps: [`1-қадам: Оқылған беттер = ${total} * ${partNum}/${partDen} = ${partVal}`, `2-қадам: Қалғаны = ${total} - ${partVal} = ${rem} бет`],
        descriptor: 'Санның бөлігін табуды өмірлік мәнмәтінде қолданады.',
        points: 3,
      };
    }
  }

  // ========================================================
  // 8. QUADRATICS & SQUARE ROOTS (8.1А, 8.2В, түбір, квадрат теңдеу)
  // ========================================================
  if (
    code.includes('8.1А') ||
    code.includes('8.2В') ||
    rawTitle.includes('квадрат түбір') ||
    rawTitle.includes('квадрат теңдеу') ||
    rawId.includes('square-roots') ||
    rawId.includes('quadratic-equations')
  ) {
    if (level === 'A') {
      const x1 = randInt(2, 25);
      const sq = x1 * x1;
      const q = `Арифметикалық квадрат түбірді есептеңіз: √${sq} = ?`;
      const correct = `${x1}`;
      const opts = shuffle([correct, `${x1 * 2}`, `${Math.round(sq / 2)}`, `${x1 + 1}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Арифметикалық квадрат түбір',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `Квадраты ${sq}-қа тең болатын оң санды табыңыз.`,
        hint2: `${x1}² = ${sq}, сондықтан √${sq} = ${x1}.`,
        solutionSteps: [`1-қадам: ${x1}^2 = ${sq}`, `2-қадам: √${sq} = ${x1}`],
        descriptor: 'Арифметикалық квадрат түбірдің анықтамасын біледі және есептейді.',
        points: 1,
      };
    } else if (level === 'B') {
      const r1 = randInt(1, 9);
      const r2 = randInt(r1 + 1, 14);
      const bCoeff = -(r1 + r2);
      const cCoeff = r1 * r2;
      const q = `Квадрат теңдеудің түбірлерін табыңыз: x² ${bCoeff}x + ${cCoeff} = 0`;
      const correct = `x₁ = ${r1}, x₂ = ${r2}`;
      const opts = shuffle([correct, `x₁ = -${r1}, x₂ = -${r2}`, `x₁ = ${r1 + 1}, x₂ = ${r2}`, `x₁ = ${r1}, x₂ = -${r2}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Виет теоремасы немесе дискриминантпен квадрат теңдеу шешу',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `Виет теоремасы: x₁ + x₂ = ${r1 + r2}, ал x₁ * x₂ = ${cCoeff}.`,
        hint2: `Түбірлері: ${r1} және ${r2}.`,
        solutionSteps: [`1-қадам: D = b^2 - 4ac = ${bCoeff * bCoeff} - ${4 * cCoeff} = ${(r2 - r1) * (r2 - r1)}`, `2-қадам: x = (${-bCoeff} ± ${r2 - r1}) / 2`, `3-қадам: x₁ = ${r1}, x₂ = ${r2}`],
        descriptor: 'Квадрат теңдеудің түбірлерін табады.',
        points: 2,
      };
    } else {
      const kFactor = randInt(2, 8);
      const prime = pickOne([2, 3, 5, 7]);
      const underRoot = kFactor * kFactor * prime;
      const q = `Түбір астындағы көбейткішті түбірдің алдына шығарыңыз: √${underRoot} = ?`;
      const correct = `${kFactor}√${prime}`;
      const opts = shuffle([
        correct,
        `${prime}√${kFactor}`,
        `${kFactor * 2}√${prime}`,
        `${kFactor}√${underRoot}`,
      ]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Көбейткішті түбір таңбасының алдына шығару',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `Санды көбейткіштерге жіктеңіз: ${underRoot} = ${kFactor * kFactor} * ${prime}.`,
        hint2: `√(${kFactor * kFactor} * ${prime}) = √(${kFactor * kFactor}) * √${prime} = ${kFactor}√${prime}.`,
        solutionSteps: [`1-қадам: ${underRoot} = ${kFactor}^2 * ${prime}`, `2-қадам: √(${kFactor}^2) * √${prime} = ${kFactor}√${prime}`],
        descriptor: 'Арифметикалық түбірдің қасиеттерін қолданып өрнекті ықшамдайды.',
        points: 3,
      };
    }
  }

  // ========================================================
  // 9. PROGRESSIONS (9.2А, прогрессия)
  // ========================================================
  if (code.includes('9.2А') || rawTitle.includes('прогрессия') || rawId.includes('progression')) {
    const a1 = randInt(2, 14);
    const d = randInt(2, 8);
    const n = randInt(4, 15);
    const an = a1 + (n - 1) * d;
    const Sn = ((a1 + an) * n) / 2;

    if (level === 'A') {
      const q = `Арифметикалық прогрессияда a₁ = ${a1}, d = ${d}. Осы прогрессияның ${n}-ші мүшесі a${n}-ді табыңыз:`;
      const correct = `${an}`;
      const opts = shuffle([correct, `${an + d}`, `${an - d}`, `${an + 2 * d}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Арифметикалық прогрессияның n-ші мүшесінің формуласы',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'an = a₁ + (n - 1)d формуласын қолданыңыз.',
        hint2: `a${n} = ${a1} + (${n} - 1)*${d} = ${an}.`,
        solutionSteps: [`1-қадам: an = a₁ + (n - 1)d`, `2-қадам: a${n} = ${a1} + ${n - 1} * ${d} = ${an}`],
        descriptor: 'Прогрессияның n-ші мүшесін формула бойынша есептейді.',
        points: 1,
      };
    } else if (level === 'B') {
      const q = `Арифметикалық прогрессияда a₁ = ${a1}, a${n} = ${an}, n = ${n}. Алғашқы ${n} мүшесінің қосындысы S${n}-ді табыңыз:`;
      const correct = `${Sn}`;
      const opts = shuffle([correct, `${Sn + 10}`, `${Math.max(1, Sn - 8)}`, `${Sn * 2}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Арифметикалық прогрессия мүшелерінің қосындысы',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Sn = (a₁ + an) / 2 * n.',
        hint2: `(${a1} + ${an}) / 2 * ${n} = ${Sn}.`,
        solutionSteps: [`1-қадам: Sn = (a₁ + an) / 2 * n`, `2-қадам: (${a1} + ${an}) / 2 * ${n} = ${Sn}`],
        descriptor: 'Прогрессияның қосындысын есептейді.',
        points: 2,
      };
    } else {
      const b1 = randInt(3, 25) * 2;
      const S = b1 * 2;
      const q = `Шексіз кемімелі геометриялық прогрессияда b₁ = ${b1}, ал еселігі q = 1/2. Осы прогрессияның қосындысын табыңыз:`;
      const correct = `${S}`;
      const opts = shuffle([correct, `${S + b1}`, `${Math.round(S / 2)}`, `${b1 + 6}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Шексіз кемімелі геометриялық прогрессия қосындысы',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'S = b₁ / (1 - q).',
        hint2: `S = ${b1} / (1 - 0.5) = ${b1} / 0.5 = ${S}.`,
        solutionSteps: [`1-қадам: S = b₁ / (1 - q)`, `2-қадам: ${b1} / (1/2) = ${S}`],
        descriptor: 'Шексіз кемімелі геометриялық прогрессия қосындысы формуласын қолданады.',
        points: 3,
      };
    }
  }

  // ========================================================
  // 10. GEOMETRY: POLYGONS, TRIANGLES, AREAS, PYTHAGORAS
  // ========================================================
  if (
    rawTitle.includes('үшбұрыш') ||
    rawTitle.includes('төртбұрыш') ||
    rawTitle.includes('көпбұрыш') ||
    rawTitle.includes('аудан') ||
    rawTitle.includes('параллелограмм') ||
    rawTitle.includes('ромб') ||
    rawTitle.includes('трапеция') ||
    rawTitle.includes('пифагор') ||
    rawTitle.includes('вектор') ||
    rawId.includes('triangle') ||
    rawId.includes('polygon') ||
    rawId.includes('areas')
  ) {
    if (level === 'A') {
      const a = randInt(4, 25);
      const b = randInt(3, 20);
      const area = a * b;
      const P = 2 * (a + b);
      const q = `Тіктөртбұрыштың қабырғалары ${a} см және ${b} см. Оның периметрі мен ауданын табыңыз:`;
      const correct = `P = ${P} см, S = ${area} см²`;
      const opts = shuffle([
        correct,
        `P = ${a + b} см, S = ${area} см²`,
        `P = ${P} см, S = ${a * 2 + b * 2} см²`,
        `P = ${area} см, S = ${P} см²`,
      ]);
      return {
        id: uniqueId,
        grade,
        subject: 'Геометрия',
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Тіктөртбұрыштың периметрі мен ауданын есептеу',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'P = 2*(a + b), S = a * b.',
        hint2: `P = 2*(${a} + ${b}) = ${P}, S = ${a}*${b} = ${area}.`,
        solutionSteps: [`1-қадам: P = 2 * (${a} + ${b}) = ${P} см`, `2-қадам: S = ${a} * ${b} = ${area} см²`],
        descriptor: 'Тіктөртбұрыштың негізгі өлшемдерін қатесіз есептейді.',
        points: 1,
      };
    } else if (level === 'B') {
      const baseTriples = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
      ];
      const base = pickOne(baseTriples);
      const scale = randInt(1, 6);
      const cat1 = base[0] * scale;
      const cat2 = base[1] * scale;
      const hyp = base[2] * scale;
      const q = `Тікбұрышты үшбұрыштың катеттері ${cat1} см және ${cat2} см. Оның гипотенузасын табыңыз:`;
      const correct = `${hyp} см`;
      const opts = shuffle([correct, `${hyp + scale} см`, `${cat1 + cat2} см`, `${hyp + scale * 2} см`]);
      return {
        id: uniqueId,
        grade,
        subject: 'Геометрия',
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Пифагор теоремасын қолдану',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Пифагор теоремасы: c² = a² + b².',
        hint2: `c² = ${cat1}² + ${cat2}² = ${cat1 * cat1} + ${cat2 * cat2} = ${hyp * hyp} => c = ${hyp}.`,
        solutionSteps: [`1-қадам: c^2 = ${cat1}^2 + ${cat2}^2 = ${hyp * hyp}`, `2-қадам: c = √${hyp * hyp} = ${hyp} см`],
        descriptor: 'Пифагор теоремасын қолданып белгісіз қабырғаны табады.',
        points: 2,
      };
    } else {
      const a = randInt(6, 30) * 2;
      const h = randInt(4, 25);
      const area = (a * h) / 2;
      const q = `Үшбұрыштың қабырғасы ${a} см, ал оған түсірілген биіктігі ${h} см. Осы үшбұрыштың ауданын табыңыз:`;
      const correct = `${area} см²`;
      const opts = shuffle([correct, `${a * h} см²`, `${area + 10} см²`, `${Math.max(5, area - 5)} см²`]);
      return {
        id: uniqueId,
        grade,
        subject: 'Геометрия',
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Үшбұрыштың ауданы формуласын қолдану',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Үшбұрыштың ауданы: S = (1/2) * a * h.',
        hint2: `S = 0.5 * ${a} * ${h} = ${area} см².`,
        solutionSteps: [`1-қадам: S = (1/2) * a * h`, `2-қадам: S = (1/2) * ${a} * ${h} = ${area} см²`],
        descriptor: 'Үшбұрыштың ауданын табу формуласын дұрыс есептейді.',
        points: 3,
      };
    }
  }

  // ========================================================
  // 11. UNIVERSAL MULTI-TEMPLATE HIGH-ENTROPY GENERATOR
  // (Guarantees infinite variation for ALL other curriculum topics)
  // ========================================================
  const dynamicArchetype = randInt(0, 5);

  if (level === 'A') {
    if (dynamicArchetype === 0) {
      const n1 = randInt(14, 99);
      const n2 = randInt(3, 19);
      const n3 = randInt(10, 60);
      const res = n1 * n2 - n3;
      const q = `[${topic.sectionCode || `${grade}-сынып`}] ${topic.title}: Өрнектің мәнін табыңыз: ${n1} * ${n2} - ${n3} = ?`;
      const correct = `${res}`;
      const opts = shuffle([correct, `${res + n2}`, `${res - n2}`, `${res + 10}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: topic.learningObjectives[0] || 'Амалдар реті мен есептеулер',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Алдымен көбейтуді, сосын азайтуды орындаңыз.',
        hint2: `${n1} * ${n2} = ${n1 * n2}, сосын ${n1 * n2} - ${n3} = ${res}.`,
        solutionSteps: [`1-қадам: ${n1} * ${n2} = ${n1 * n2}`, `2-қадам: ${n1 * n2} - ${n3} = ${res}`],
        descriptor: 'Амалдардың орындалу ретін сақтай отырып өрнектің мәнін табады.',
        points: 1,
      };
    } else if (dynamicArchetype === 1) {
      const num = randInt(40, 300);
      const pct = pickOne([5, 10, 15, 20, 25, 40, 50, 75]);
      const res = (num * pct) / 100;
      const q = `[${topic.sectionCode || `${grade}-сынып`}] ${topic.title}: ${num} санының ${pct}%-ін табыңыз:`;
      const correct = `${res}`;
      const opts = shuffle([correct, `${res + 5}`, `${Math.max(1, res - 5)}`, `${res * 2}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Санның пайызын табу',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `Санды пайызға көбейтіп, 100-ге бөліңіз: (${num} * ${pct}) / 100.`,
        hint2: `${num} * ${pct / 100} = ${res}.`,
        solutionSteps: [`1-қадам: ${num} * ${pct} / 100`, `2-қадам: Нәтижесі: ${res}`],
        descriptor: 'Санның берілген пайызын дұрыс есептейді.',
        points: 1,
      };
    } else if (dynamicArchetype === 2) {
      const a = randInt(2, 20);
      const b = randInt(2, 20);
      const q = `[${topic.sectionCode || `${grade}-сынып`}] ${topic.title}: Квадраттардың қосындысын есептеңіз: ${a}² + ${b}² = ?`;
      const correct = `${a * a + b * b}`;
      const opts = shuffle([correct, `${(a + b) * (a + b)}`, `${a * a + b * b + 10}`, `${a * a + b * b - 4}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Сандардың дәрежелері мен қосындысы',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Әрбір санды дәрежеге шығарып, содан кейін қосыңыз.',
        hint2: `${a}² = ${a * a}, ${b}² = ${b * b}. ${a * a} + ${b * b} = ${a * a + b * b}.`,
        solutionSteps: [`1-қадам: ${a}^2 = ${a * a}, ${b}^2 = ${b * b}`, `2-қадам: ${a * a} + ${b * b} = ${a * a + b * b}`],
        descriptor: 'Сандардың квадраттарының қосындысын есептейді.',
        points: 1,
      };
    } else if (dynamicArchetype === 3) {
      const v = randInt(40, 110);
      const t = randInt(2, 7);
      const s = v * t;
      const q = `[${topic.sectionCode || `${grade}-сынып`}] ${topic.title}: Жылдамдығы ${v} км/сағ болатын көлік ${t} сағатта қандай қашықтықты жүріп өтеді?`;
      const correct = `${s} км`;
      const opts = shuffle([correct, `${s + v} км`, `${Math.max(10, s - v)} км`, `${v + t} км`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Жол, жылдамдық және уақыт формуласы',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Қашықтық формуласы: S = v * t.',
        hint2: `S = ${v} * ${t} = ${s} км.`,
        solutionSteps: [`1-қадам: S = v * t`, `2-қадам: ${v} * ${t} = ${s} км`],
        descriptor: 'Жылдамдық пен уақыт арқылы жолды есептейді.',
        points: 1,
      };
    } else {
      const n1 = randInt(15, 80);
      const n2 = randInt(5, 45);
      const n3 = randInt(2, 9);
      const q = `[${topic.sectionCode || `${grade}-сынып`}] ${topic.title}: Жақшалы өрнекті есептеңіз: (${n1} + ${n2}) * ${n3} = ?`;
      const correct = `${(n1 + n2) * n3}`;
      const opts = shuffle([correct, `${n1 + n2 * n3}`, `${(n1 + n2) * n3 + 10}`, `${(n1 + n2) * n3 - 10}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'A',
        levelLabel: 'А: Базалық деңгей (Білу және түсіну)',
        learningObjective: 'Жақшалы өрнектерді есептеу',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Алдымен жақша ішіндегі амалды орындаңыз.',
        hint2: `${n1} + ${n2} = ${n1 + n2}, сосын ${n1 + n2} * ${n3} = ${(n1 + n2) * n3}.`,
        solutionSteps: [`1-қадам: ${n1} + ${n2} = ${n1 + n2}`, `2-қадам: ${n1 + n2} * ${n3} = ${(n1 + n2) * n3}`],
        descriptor: 'Жақшалары бар арифметикалық өрнекті дұрыс есептейді.',
        points: 1,
      };
    }
  } else if (level === 'B') {
    if (dynamicArchetype === 0 || dynamicArchetype === 1) {
      const k = randInt(2, 11);
      const x = randInt(3, 24);
      const b = randInt(5, 45);
      const rhs = k * x + b;
      const q = `[${topic.sectionCode || `${grade}-сынып`}] ${topic.title}: Теңдеуді шешіңіз: ${k}x + ${b} = ${rhs}`;
      const correct = `x = ${x}`;
      const opts = shuffle([correct, `x = ${x + 1}`, `x = ${Math.max(1, x - 1)}`, `x = ${x + 2}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Сызықтық теңдеуді шешу алгоритмі',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `${b} санын оң жаққа таңбасын өзгертіп көшіріңіз.`,
        hint2: `${k}x = ${rhs - b} => x = ${x}.`,
        solutionSteps: [`1-қадам: ${k}x = ${rhs} - ${b} = ${rhs - b}`, `2-қадам: x = ${rhs - b} / ${k} = ${x}`],
        descriptor: 'Стандартты алгоритм бойынша теңдеуді шешеді.',
        points: 2,
      };
    } else {
      const a = randInt(3, 20);
      const b = randInt(2, 15);
      const c = randInt(1, 8);
      const q = `[${topic.sectionCode || `${grade}-сынып`}] ${topic.title}: Егер a = ${a}, b = ${b}, c = ${c} болса, 2a + 3b - 4c өрнегінің мәнін табыңыз:`;
      const correct = `${2 * a + 3 * b - 4 * c}`;
      const opts = shuffle([correct, `${2 * a + 3 * b + 4 * c}`, `${a + b - c}`, `${2 * a + 3 * b - 4 * c + 6}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'B',
        levelLabel: 'В: Қолдану деңгейі (Алгоритмдік)',
        learningObjective: 'Әріпті өрнектердің мәнін есептеу',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Әріптердің орындарына тиісті сандарды қойып есептеңіз.',
        hint2: `2*${a} + 3*${b} - 4*${c} = ${2 * a} + ${3 * b} - ${4 * c} = ${2 * a + 3 * b - 4 * c}.`,
        solutionSteps: [`1-қадам: 2*${a} = ${2 * a}, 3*${b} = ${3 * b}, 4*${c} = ${4 * c}`, `2-қадам: ${2 * a} + ${3 * b} - ${4 * c} = ${2 * a + 3 * b - 4 * c}`],
        descriptor: 'Әріпті өрнектің сан мәнін алгоритм бойынша табады.',
        points: 2,
      };
    }
  } else {
    // Level C
    if (dynamicArchetype % 2 === 0) {
      const a = randInt(2, 10);
      const b = randInt(3, 11);
      const c = randInt(2, 8);
      const resVal = a * b * c - (a + b + c);
      const q = `[${topic.sectionCode || `${grade}-сынып`}] ${topic.title}: Өрнекті ықшамдап мәнін табыңыз: (${a} * ${b} * ${c}) - (${a} + ${b} + ${c}) = ?`;
      const correct = `${resVal}`;
      const opts = shuffle([correct, `${resVal + 10}`, `${Math.max(1, resVal - 10)}`, `${a * b * c}`]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Көпқадамды арифметикалық талдау',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: 'Алдымен көбейтіндіні, кейін қосындыны тауып, азайтыңыз.',
        hint2: `${a * b * c} - ${a + b + c} = ${resVal}.`,
        solutionSteps: [`1-қадам: ${a} * ${b} * ${c} = ${a * b * c}`, `2-қадам: ${a} + ${b} + ${c} = ${a + b + c}`, `3-қадам: ${a * b * c} - ${a + b + c} = ${resVal}`],
        descriptor: 'Көпқадамды түрлендіру мен логикалық есептеулерді орындайды.',
        points: 3,
      };
    } else {
      const price = randInt(12, 80) * 100;
      const discount = pickOne([10, 15, 20, 25, 30, 40]);
      const discountVal = (price * discount) / 100;
      const finalPrice = price - discountVal;
      const q = `[${topic.sectionCode || `${grade}-сынып`}] ${topic.title}: Тауардың бағасы ${price} теңге. Оған ${discount}% жеңілдік жасалды. Тауардың соңғы бағасы қанша теңге?`;
      const correct = `${finalPrice} тг`;
      const opts = shuffle([
        correct,
        `${finalPrice + 500} тг`,
        `${price - discount} тг`,
        `${discountVal} тг`,
      ]);
      return {
        id: uniqueId,
        grade,
        subject: topic.subject,
        quarter: topic.quarter,
        sectionCode: topic.sectionCode,
        topicId: topic.id,
        topicTitle: topic.title,
        level: 'C',
        levelLabel: 'С: Күрделі деңгей (Талдау және логика)',
        learningObjective: 'Өмірлік мәнмәтінді экономикалық есептер',
        question: q,
        options: opts,
        correctAnswer: correct,
        hint1: `Алдымен жеңілдік сомасын табамыз: ${price} * ${discount / 100} = ${discountVal} тг.`,
        hint2: `${price} - ${discountVal} = ${finalPrice} тг.`,
        solutionSteps: [`1-қадам: Жеңілдік: ${price} * ${discount}% = ${discountVal} тг`, `2-қадам: Соңғы баға: ${price} - ${discountVal} = ${finalPrice} тг`],
        descriptor: 'Пайызға байланысты өмірлік қолданбалы есепті шығарады.',
        points: 3,
      };
    }
  }
}
