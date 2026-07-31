// src/utils/textFilter.ts

const profaneKeywords = [
  // Italian profanities & blasphemies (bestemmie)
  'porco', 'porca', 'bastardo', 'bastarda', 'stronzo', 'stronza',
  'cazzo', 'figa', 'troia', 'puttana', 'zoccola', 'bocchina', 'bocchino',
  'merda', 'vaffanculo', 'fanculo', 'minchia', 'coglione', 'coglioni', 'pedofilo',
  'sessuale', 'porno', 'pornografia', 'hentai', 'sesso', 'penis', 'vagina', 'sega',

  // English profanities
  'fuck', 'shit', 'bitch', 'whore', 'slut', 'cunt', 'dick', 'pussy', 'cock', 'nigger', 'nigga', 'retard'
];

export const normalizeTextForFilter = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/[^a-z]/g, '');
};

export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  const rawLower = text.toLowerCase();
  const normalized = normalizeTextForFilter(text);

  // Direct check for Italian blasphemy patterns (bestemmie)
  const blasphemyRegex = /(dio|madonna|cristo|gesu)\s*(porco|porca|cane|bastard|troia|puttana|maial|boia|ladro)/i;
  const reverseBlasphemyRegex = /(porco|porca|cane|bastard|troia|puttana|maial)\s*(dio|madonna|cristo|gesu)/i;

  if (blasphemyRegex.test(rawLower) || reverseBlasphemyRegex.test(rawLower)) {
    return true;
  }
  if (blasphemyRegex.test(normalized) || reverseBlasphemyRegex.test(normalized)) {
    return true;
  }

  // Check normalized blasphemy strings like "dioporco", "madonnatroia", "porcodio"
  if (
    normalized.includes('dioporco') ||
    normalized.includes('diocane') ||
    normalized.includes('diobastardo') ||
    normalized.includes('dioboia') ||
    normalized.includes('porcodio') ||
    normalized.includes('porcamadonna') ||
    normalized.includes('madonnatroia') ||
    normalized.includes('madonnaputtana') ||
    normalized.includes('cristobastardo') ||
    normalized.includes('porcocristo')
  ) {
    return true;
  }

  // Word checks
  for (const word of profaneKeywords) {
    if (normalized.includes(word) || rawLower.includes(word)) {
      return true;
    }
  }

  return false;
};
