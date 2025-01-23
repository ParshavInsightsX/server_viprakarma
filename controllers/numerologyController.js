// server/controller/numerologyController.js

const generateNumerology = (req, res) => {
  try {
    const { fullName, dateOfBirth } = req.body;

    // Validate inputs
    if (!fullName || !dateOfBirth) {
      return res.status(400).json({ error: 'Missing required fields: fullName and dateOfBirth.' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (/^[^A-Za-z]+$/.test(fullName)) {
      return res.status(400).json({ error: 'Full name must contain at least one alphabetic character.' });
    }

    // ---------------------------
    // 1) Psychic Number (Moolank)
    // ---------------------------
    const psychicNumberValue = calculatePsychicNumber(dateOfBirth);

    // ---------------------------
    // 2) Destiny Number (Bhagyank)
    // ---------------------------
    const destinyNumberValue = calculateDestinyNumber(dateOfBirth);

    // ---------------------------------
    // 3) Name Number (Namank) – sum all
    // ---------------------------------
    const nameNumberValue = calculateNameNumber(fullName);

    // ----------------------------
    // 4) Soul Urge Number – vowels
    // ----------------------------
    const soulUrgeValue = calculateSoulUrge(fullName);

    // ----------------------------
    // 5) Personality Number – cons.
    // ----------------------------
    const personalityValue = calculatePersonality(fullName);

    // -------------------------------------------
    // 6) Expression Number – sum all name letters
    // -------------------------------------------
    const expressionValue = calculateExpression(fullName);

    // ---------------------------------
    // 7) Divine Number (Birthday Num.)
    // ---------------------------------
    const divineValue = calculateDivineNumber(dateOfBirth);

    // -----------------------------
    // 8) Personal Year Number
    // -----------------------------
    const personalYearValue = calculatePersonalYearNumber(dateOfBirth);

    // -----------------------------
    // 9) Personal Month Number
    // -----------------------------
    const personalMonthValue = calculatePersonalMonthNumber(dateOfBirth);

    // Build descriptive JSON response
    const responseData = {
      fullName,
      dateOfBirth,
      data: {
        psychic_number: {
          name: 'Psychic Number (Moolank)',
          number: psychicNumberValue,
          description: getPsychicDescription(psychicNumberValue),
        },
        destiny_number: {
          name: 'Destiny Number (Bhagyank)',
          number: destinyNumberValue,
          description: getDestinyDescription(destinyNumberValue),
        },
        name_number: {
          name: 'Name Number (Namank)',
          number: nameNumberValue,
          description: getNameNumberDescription(nameNumberValue),
        },
        soul_urge_number: {
          name: 'Soul Urge Number',
          number: soulUrgeValue,
          description: getSoulUrgeDescription(soulUrgeValue),
        },
        personality_number: {
          name: 'Personality Number',
          number: personalityValue,
          description: getPersonalityDescription(personalityValue),
        },
        expression_number: {
          name: 'Expression Number',
          number: expressionValue,
          description: getExpressionDescription(expressionValue),
        },
        divine_number: {
          name: 'Divine Number',
          number: divineValue,
          description: getDivineDescription(divineValue),
        },
        personal_year_number: {
          name: 'Personal Year Number',
          number: personalYearValue,
          description: getPersonalYearDescription(personalYearValue),
        },
        personal_month_number: {
          name: 'Personal Month Number',
          number: personalMonthValue,
          description: getPersonalMonthDescription(personalMonthValue),
        },
      },
    };

    return res.json(responseData);
  } catch (err) {
    console.error('Error generating numerology:', err);
    return res.status(500).json({ error: 'Numerology generation failed.' });
  }
};

/* --------------------------------------------------
 *  N U M E R I C   R E D U C T I O N   &   M A P S
 * -------------------------------------------------- */

/**
 * Reduce a number to a single digit or master number (11, 22, 33).
 * @param {number} num - The number to reduce.
 * @returns {number} Reduced (core) number.
 */
const reduceToCoreNumber = (num) => {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return num;
};

// Character map for converting letters to their numeric values (Pythagorean)
const charMap = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

/* --------------------------------------------------
 * 1) Psychic Number
 *    - Typically the DAY of birth, reduced to single digit or master.
 * -------------------------------------------------- */
function calculatePsychicNumber(dob) {
  // dob in YYYY-MM-DD
  const [year, month, day] = dob.split('-').map(Number);
  return reduceToCoreNumber(day);
}

/* --------------------------------------------------
 * 2) Destiny Number (Bhagyank)
 *    - Sum of entire date (YYYY+MM+DD).
 * -------------------------------------------------- */
function calculateDestinyNumber(dob) {
  const digits = dob.replace(/\D/g, ''); // remove non-numerics
  const total = digits
    .split('')
    .map(Number)
    .reduce((acc, curr) => acc + curr, 0);
  return reduceToCoreNumber(total);
}

/* --------------------------------------------------
 * 3) Name Number (Namank)
 *    - Sum of all letters in the name (similar to Expression).
 *      Some Vedic traditions call the "Name Number" differently,
 *      but commonly it's the sum of all letters.
 * -------------------------------------------------- */
function calculateNameNumber(name) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  const total = letters
    .split('')
    .reduce((sum, char) => sum + (charMap[char] || 0), 0);
  return reduceToCoreNumber(total);
}

/* --------------------------------------------------
 * 4) Soul Urge Number (Vowels only)
 * -------------------------------------------------- */
function calculateSoulUrge(name) {
  const vowels = name.toUpperCase().replace(/[^AEIOU]/g, '');
  const total = vowels
    .split('')
    .reduce((sum, char) => sum + (charMap[char] || 0), 0);
  return reduceToCoreNumber(total);
}

/* --------------------------------------------------
 * 5) Personality Number (Consonants)
 * -------------------------------------------------- */
function calculatePersonality(name) {
  const consonants = name
    .toUpperCase()
    .replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/g, '');
  const total = consonants
    .split('')
    .reduce((sum, char) => sum + (charMap[char] || 0), 0);
  return reduceToCoreNumber(total);
}

/* --------------------------------------------------
 * 6) Expression Number (All letters)
 * -------------------------------------------------- */
function calculateExpression(name) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  const total = letters
    .split('')
    .reduce((sum, char) => sum + (charMap[char] || 0), 0);
  return reduceToCoreNumber(total);
}

/* --------------------------------------------------
 * 7) Divine Number (Birthday Number)
 *    - Variation: sum all digits of birth date,
 *      reduce to single or master.
 * -------------------------------------------------- */
function calculateDivineNumber(dob) {
  const digits = dob.replace(/\D/g, '').split('').map(Number);
  let sum = digits.reduce((acc, curr) => acc + curr, 0);
  return reduceToCoreNumber(sum);
}

/* --------------------------------------------------
 * 8) Personal Year Number
 *    - (Day + Month + Current Year)
 * -------------------------------------------------- */
function calculatePersonalYearNumber(dob) {
  const now = new Date();
  const currentYear = now.getFullYear();

  const [year, month, day] = dob.split('-').map(Number);
  // Sum day + month + currentYear
  const total = day + month + currentYear;
  return reduceToCoreNumber(total);
}

/* --------------------------------------------------
 * 9) Personal Month Number
 *    - Personal Year Number + current month, or
 *      (Day + Month + currentYear + currentMonth).
 *      Many variations exist; here's a common approach:
 * -------------------------------------------------- */
function calculatePersonalMonthNumber(dob) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  // We can reuse personalYear, then add the current month
  const personalYear = calculatePersonalYearNumber(dob);
  const total = personalYear + currentMonth;
  return reduceToCoreNumber(total);
}
/* ------------------------------------------------------------------
 *  D E S C R I P T I O N   D I C T I O N A R I E S  
 * ------------------------------------------------------------------ */
const psychicDescriptions = {
  1: 'Psychic 1: Strong individuality, leadership, and self-reliance.',
  2: 'Psychic 2: Diplomatic, sensitive, and cooperative.',
  3: 'Psychic 3: Joyful, creative, and expressive.',
  4: 'Psychic 4: Practical, grounded, and organized.',
  5: 'Psychic 5: Versatile, adventurous, and freedom-loving.',
  6: 'Psychic 6: Responsible, caring, and family-oriented.',
  7: 'Psychic 7: Introspective, analytical, and spiritual.',
  8: 'Psychic 8: Ambitious, executive skills, and power-driven.',
  9: 'Psychic 9: Compassionate, generous, and broad-minded.',
  11: 'Psychic 11: Highly intuitive, visionary, and spiritually aware.',
  22: 'Psychic 22: Master builder—practical vision on a large scale.',
  33: 'Psychic 33: Master teacher—compassion, nurturing, spiritual service.',
};

const destinyDescriptions = {
  1: 'Destiny 1: You are meant to be a leader and innovator.',
  2: 'Destiny 2: You are meant to be a peacemaker and partner.',
  3: 'Destiny 3: You are meant to be creative and communicative.',
  4: 'Destiny 4: You are meant to be structured and reliable.',
  5: 'Destiny 5: You are meant to be adaptable and experience freedom.',
  6: 'Destiny 6: You are meant to nurture, protect, and teach.',
  7: 'Destiny 7: You are meant to seek truth, knowledge, and deeper meaning.',
  8: 'Destiny 8: You are meant to attain success, power, and abundance.',
  9: 'Destiny 9: You are meant to serve humanity with compassion.',
  11: 'Destiny 11: You are meant to uplift others with spiritual insight.',
  22: 'Destiny 22: You are meant to build something that benefits many.',
  33: 'Destiny 33: You are meant to share love and enlightenment on a broader scale.',
};

const nameNumberDescriptions = {
  1: 'Name Number 1: You project leadership and independence through your name.',
  2: 'Name Number 2: You project harmony and sensitivity in social situations.',
  3: 'Name Number 3: You project creativity, optimism, and charm.',
  4: 'Name Number 4: You project stability, practicality, and reliability.',
  5: 'Name Number 5: You project a love of freedom, adaptability, and adventure.',
  6: 'Name Number 6: You project nurturing, responsibility, and compassion.',
  7: 'Name Number 7: You project intellect, introspection, and a bit of mystery.',
  8: 'Name Number 8: You project ambition, authority, and the drive to succeed.',
  9: 'Name Number 9: You project generosity, broad-mindedness, and compassion.',
  11: 'Name Number 11: You project visionary energy, intuition, and spiritual depth.',
  22: 'Name Number 22: You project master building power—turning big dreams into reality.',
  33: 'Name Number 33: You project a loving, healing, and teaching presence.',
};

const soulUrgeNumberDescriptions = {
  1: 'Soul Urge 1: You yearn for independence, recognition, and being the best.',
  2: 'Soul Urge 2: You yearn for peace, harmony, and emotional connections.',
  3: 'Soul Urge 3: You yearn for creativity, self-expression, and joy.',
  4: 'Soul Urge 4: You yearn for stability, security, and order.',
  5: 'Soul Urge 5: You yearn for variety, adventure, and personal freedom.',
  6: 'Soul Urge 6: You yearn for love, family, and helping others.',
  7: 'Soul Urge 7: You yearn for knowledge, introspection, and spiritual wisdom.',
  8: 'Soul Urge 8: You yearn for accomplishment, influence, and abundance.',
  9: 'Soul Urge 9: You yearn to serve humanity and live with compassion.',
  11: 'Soul Urge 11: You yearn to inspire others and elevate consciousness.',
  22: 'Soul Urge 22: You yearn to create lasting structures that benefit many.',
  33: 'Soul Urge 33: You yearn to uplift others with unconditional love and service.',
};

const personalityNumberDescriptions = {
  1: 'Personality 1: People see you as confident, direct, and self-reliant.',
  2: 'Personality 2: People see you as gentle, cooperative, and kind.',
  3: 'Personality 3: People see you as outgoing, charming, and energetic.',
  4: 'Personality 4: People see you as dependable, systematic, and grounded.',
  5: 'Personality 5: People see you as adaptable, fun-loving, and restless.',
  6: 'Personality 6: People see you as caring, supportive, and family-oriented.',
  7: 'Personality 7: People see you as wise, reflective, and somewhat reserved.',
  8: 'Personality 8: People see you as ambitious, authoritative, and success-oriented.',
  9: 'Personality 9: People see you as generous, broad-minded, and humanitarian.',
  11: 'Personality 11: People see you as highly intuitive, inspirational, and charismatic.',
  22: 'Personality 22: People see you as practical yet visionary, with big plans.',
  33: 'Personality 33: People see you as nurturing, empathetic, and uplifting.',
};

const expressionNumberDescriptions = {
  1: 'Expression 1: You embody a pioneering, leadership-oriented approach to life.',
  2: 'Expression 2: You embody cooperation, diplomacy, and a harmonious mindset.',
  3: 'Expression 3: You embody creativity, communication, and joyful expression.',
  4: 'Expression 4: You embody practicality, structure, and strong work ethic.',
  5: 'Expression 5: You embody versatility, energy, and a love of freedom.',
  6: 'Expression 6: You embody responsibility, nurturing, and family devotion.',
  7: 'Expression 7: You embody analytical thinking, introspection, and spirituality.',
  8: 'Expression 8: You embody ambition, executive power, and achievement.',
  9: 'Expression 9: You embody compassion, tolerance, and humanitarian ideals.',
  11: 'Expression 11: You embody elevated intuition, inspiration, and vision.',
  22: 'Expression 22: You embody master builder energy—turning dreams into reality.',
  33: 'Expression 33: You embody selfless service, spiritual teaching, and compassion.',
};

const divineNumberDescriptions = {
  1: 'Divine 1: Symbolizes individuality, fresh starts, and pioneering energy.',
  2: 'Divine 2: Symbolizes balance, relationships, and cooperation.',
  3: 'Divine 3: Symbolizes creativity, optimism, and social engagement.',
  4: 'Divine 4: Symbolizes stability, groundedness, and discipline.',
  5: 'Divine 5: Symbolizes adaptability, change, and a zest for life.',
  6: 'Divine 6: Symbolizes responsibility, harmony, and family ties.',
  7: 'Divine 7: Symbolizes introspection, research, and spiritual insight.',
  8: 'Divine 8: Symbolizes ambition, power, and material success.',
  9: 'Divine 9: Symbolizes compassion, philanthropy, and universal love.',
  11: 'Divine 11: Symbolizes spiritual insight, intuition, and higher calling.',
  22: 'Divine 22: Symbolizes large-scale vision, leadership, and practicality.',
  33: 'Divine 33: Symbolizes selfless love, devotion, and spiritual teaching.',
};

const personalYearDescriptions = {
  1: 'Personal Year 1: A year of new beginnings, leadership, and fresh opportunities.',
  2: 'Personal Year 2: A year of cooperation, patience, and relationship building.',
  3: 'Personal Year 3: A year of creativity, self-expression, and socializing.',
  4: 'Personal Year 4: A year of hard work, organization, and laying foundations.',
  5: 'Personal Year 5: A year of change, versatility, and personal freedom.',
  6: 'Personal Year 6: A year of responsibility, nurturing, and family focus.',
  7: 'Personal Year 7: A year of introspection, study, and inner growth.',
  8: 'Personal Year 8: A year of manifestation, ambition, and financial gains.',
  9: 'Personal Year 9: A year of completions, letting go, and preparing for renewal.',
  11: 'Personal Year 11: A year of heightened intuition, spiritual growth, and insight.',
  22: 'Personal Year 22: A year of master-building, turning big visions into reality.',
  33: 'Personal Year 33: A year of compassionate service, teaching, and higher ideals.',
};

const personalMonthDescriptions = {
  1: 'Personal Month 1: A month of new initiatives, fresh starts, and taking charge.',
  2: 'Personal Month 2: A month of patience, cooperation, and emotional balance.',
  3: 'Personal Month 3: A month of creativity, enjoyment, and social interaction.',
  4: 'Personal Month 4: A month of practical focus, order, and hard work.',
  5: 'Personal Month 5: A month of adaptability, excitement, and open-mindedness.',
  6: 'Personal Month 6: A month of nurturing, responsibility, and community.',
  7: 'Personal Month 7: A month of reflection, study, and spiritual awareness.',
  8: 'Personal Month 8: A month of ambition, management, and goal pursuit.',
  9: 'Personal Month 9: A month of completion, compassion, and looking ahead.',
  11: 'Personal Month 11: A month of heightened intuition, creativity, and inspiration.',
  22: 'Personal Month 22: A month of laying grand plans and practical achievements.',
  33: 'Personal Month 33: A month of selfless service, nurturing, and upliftment.',
};

/* ------------------------------------------------------------------
 *  H E L P E R   F U N C T I O N S   T O   G E T   D E S C R I P T I O N S
 * ------------------------------------------------------------------ */
function getPsychicDescription(num) {
  return psychicDescriptions[num] || 'No description for this Psychic Number.';
}

function getDestinyDescription(num) {
  return destinyDescriptions[num] || 'No description for this Destiny Number.';
}

function getNameNumberDescription(num) {
  return nameNumberDescriptions[num] || 'No description for this Name Number.';
}

function getSoulUrgeDescription(num) {
  return soulUrgeNumberDescriptions[num] || 'No description for this Soul Urge Number.';
}

function getPersonalityDescription(num) {
  return personalityNumberDescriptions[num] || 'No description for this Personality Number.';
}

function getExpressionDescription(num) {
  return expressionNumberDescriptions[num] || 'No description for this Expression Number.';
}

function getDivineDescription(num) {
  return divineNumberDescriptions[num] || 'No description for this Divine Number.';
}

function getPersonalYearDescription(num) {
  return personalYearDescriptions[num] || 'No description for this Personal Year Number.';
}

function getPersonalMonthDescription(num) {
  return personalMonthDescriptions[num] || 'No description for this Personal Month Number.';
}


/* ------------------------------------------------------------------
 *  E X P O R T
 * ------------------------------------------------------------------ */
module.exports = {
  generateNumerology,
  reduceToCoreNumber,
  // Expose any calculation functions if needed
  calculatePsychicNumber,
  calculateDestinyNumber,
  calculateNameNumber,
  calculateSoulUrge,
  calculatePersonality,
  calculateExpression,
  calculateDivineNumber,
  calculatePersonalYearNumber,
  calculatePersonalMonthNumber,
};
