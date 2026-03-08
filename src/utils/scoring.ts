import { Concurso, ScoringRule, UserProfileScoring } from '../store';
import { ESFERA_PATTERNS, MODALIDADE_PATTERNS } from '../constants';

export function calculateScore(concurso: Concurso, rules: ScoringRule[], profile?: UserProfileScoring): number {
  let score = 0;

  // 1. Apply generic rules
  for (const rule of rules) {
    const { field, condition, value, points } = rule;
    
    // Extract the raw string value from the concurso
    const rawValue = (concurso[field as keyof Concurso] as string) || '';
    
    if (condition === 'contains') {
      if (rawValue.toLowerCase().includes(value.toLowerCase())) {
        score += points;
      }
    } else if (condition === 'equals') {
      if (rawValue.toLowerCase() === value.toLowerCase()) {
        score += points;
      }
    } else if (condition === 'greater_than' || condition === 'less_than') {
      const numericValue = extractNumber(rawValue);
      const targetValue = parseFloat(value);
      
      if (!isNaN(numericValue) && !isNaN(targetValue)) {
        if (condition === 'greater_than' && numericValue > targetValue) {
          score += points;
        } else if (condition === 'less_than' && numericValue < targetValue) {
          score += points;
        }
      }
    }
  }

  // 2. Apply profile rules
  if (profile) {
    // UFs Desejadas
    if (concurso.location && profile.ufs_desejadas[concurso.location]) {
      score += profile.ufs_desejadas[concurso.location];
    }
    
    // Esferas Preferidas (using regex patterns)
    const esferaSearchText = `${concurso.esfera || ''} ${concurso.institution || ''} ${concurso.source || ''}`.toLowerCase();
    Object.entries(profile.esferas_preferidas).forEach(([category, points]) => {
      const pattern = ESFERA_PATTERNS[category];
      if (pattern) {
        if (pattern.test(esferaSearchText)) {
          score += points;
        }
      } else {
        // Fallback for exact match if no pattern exists
        if (concurso.esfera === category) {
          score += points;
        }
      }
    });

    // Modalidades Preferidas (using regex patterns)
    if (profile.modalidades_preferidas) {
      const modalidadeSearchText = `${concurso.modalidade || ''} ${concurso.institution || ''} ${concurso.source || ''}`.toLowerCase();
      Object.entries(profile.modalidades_preferidas).forEach(([category, points]) => {
        const pattern = MODALIDADE_PATTERNS[category];
        if (pattern) {
          if (pattern.test(modalidadeSearchText)) {
            score += points;
          }
        } else {
          // Fallback for exact match if no pattern exists
          if (concurso.modalidade === category) {
            score += points;
          }
        }
      });
    }
    
    // Escolaridades Preferidas (check in positions, institution, or subjects)
    if (profile.escolaridades_preferidas && Object.keys(profile.escolaridades_preferidas).length > 0) {
      const escolaridadeSearchText = `${concurso.positions || ''} ${concurso.institution || ''} ${concurso.subjects || ''}`.toLowerCase();
      Object.entries(profile.escolaridades_preferidas).forEach(([target, points]) => {
        if (escolaridadeSearchText.includes(target.toLowerCase())) {
          score += points;
        }
      });
    }
  }

  return score;
}

function extractNumber(str: string): number {
  if (!str) return NaN;
  
  // Handle cases like "R$ 5.000,00" -> 5000
  // Handle cases like "10 + CR" -> 10
  
  // Remove dots used as thousand separators, replace comma with dot for decimals
  let normalized = str.replace(/\./g, '').replace(/,/g, '.');
  
  // Extract the first sequence of digits (with optional decimal part)
  const match = normalized.match(/\d+(\.\d+)?/);
  if (match) {
    return parseFloat(match[0]);
  }
  
  return NaN;
}
