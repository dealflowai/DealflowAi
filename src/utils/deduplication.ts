export interface BuyerRecord {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  city?: string | null;
  state?: string | null;
  created_at?: string | null;
  [key: string]: any;
}

export interface DuplicateMatch {
  buyer: BuyerRecord;
  matchScore: number;
  matchReasons: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  matches: DuplicateMatch[];
  bestMatch?: DuplicateMatch;
}

// Normalize phone numbers for comparison
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}

// Normalize email for comparison
export function normalizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  return email.toLowerCase().trim();
}

// Normalize name for comparison
export function normalizeName(name: string | null | undefined): string {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
}

// Calculate string similarity using Levenshtein distance
export function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1;

  const matrix: number[][] = Array(shorter.length + 1)
    .fill(null)
    .map(() => Array(longer.length + 1).fill(null));

  for (let i = 0; i <= longer.length; i++) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= shorter.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= shorter.length; j++) {
    for (let i = 1; i <= longer.length; i++) {
      if (shorter.charAt(j - 1) === longer.charAt(i - 1)) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1
        );
      }
    }
  }

  return (longer.length - matrix[shorter.length][longer.length]) / longer.length;
}

// Check if two buyers are potential duplicates
export function checkDuplicate(
  newBuyer: Partial<BuyerRecord>,
  existingBuyer: BuyerRecord
): DuplicateMatch | null {
  const matchReasons: string[] = [];
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Email match (highest weight)
  const emailWeight = 40;
  maxPossibleScore += emailWeight;
  if (newBuyer.email && existingBuyer.email) {
    const newEmail = normalizeEmail(newBuyer.email);
    const existingEmail = normalizeEmail(existingBuyer.email);
    
    if (newEmail === existingEmail) {
      totalScore += emailWeight;
      matchReasons.push('Exact email match');
    }
  }

  // Phone match (high weight)
  const phoneWeight = 35;
  maxPossibleScore += phoneWeight;
  if (newBuyer.phone && existingBuyer.phone) {
    const newPhone = normalizePhone(newBuyer.phone);
    const existingPhone = normalizePhone(existingBuyer.phone);
    
    if (newPhone && existingPhone && newPhone === existingPhone) {
      totalScore += phoneWeight;
      matchReasons.push('Exact phone match');
    }
  }

  // Name similarity (medium weight)
  const nameWeight = 20;
  maxPossibleScore += nameWeight;
  if (newBuyer.name && existingBuyer.name) {
    const newName = normalizeName(newBuyer.name);
    const existingName = normalizeName(existingBuyer.name);
    const nameSimilarity = calculateStringSimilarity(newName, existingName);
    
    if (nameSimilarity >= 0.8) {
      totalScore += nameWeight * nameSimilarity;
      matchReasons.push(`Name similarity: ${Math.round(nameSimilarity * 100)}%`);
    }
  }

  // Company name match (medium weight)
  const companyWeight = 15;
  maxPossibleScore += companyWeight;
  if (newBuyer.company_name && existingBuyer.company_name) {
    const newCompany = normalizeName(newBuyer.company_name);
    const existingCompany = normalizeName(existingBuyer.company_name);
    const companySimilarity = calculateStringSimilarity(newCompany, existingCompany);
    
    if (companySimilarity >= 0.8) {
      totalScore += companyWeight * companySimilarity;
      matchReasons.push(`Company similarity: ${Math.round(companySimilarity * 100)}%`);
    }
  }

  // Location match (low weight)
  const locationWeight = 10;
  maxPossibleScore += locationWeight;
  if (newBuyer.city && existingBuyer.city && newBuyer.state && existingBuyer.state) {
    const newLocation = `${normalizeName(newBuyer.city)} ${normalizeName(newBuyer.state)}`;
    const existingLocation = `${normalizeName(existingBuyer.city)} ${normalizeName(existingBuyer.state)}`;
    
    if (newLocation === existingLocation) {
      totalScore += locationWeight;
      matchReasons.push('Same location');
    }
  }

  // Calculate final score as percentage
  const matchScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low';
  if (matchScore >= 70) {
    confidence = 'high';
  } else if (matchScore >= 40) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Only return matches above a minimum threshold
  if (matchScore >= 30 && matchReasons.length > 0) {
    return {
      buyer: existingBuyer,
      matchScore: Math.round(matchScore),
      matchReasons,
      confidence
    };
  }

  return null;
}

// Find all potential duplicates for a new buyer
export function findDuplicates(
  newBuyer: Partial<BuyerRecord>,
  existingBuyers: BuyerRecord[]
): DeduplicationResult {
  const matches: DuplicateMatch[] = [];

  for (const existingBuyer of existingBuyers) {
    const match = checkDuplicate(newBuyer, existingBuyer);
    if (match) {
      matches.push(match);
    }
  }

  // Sort matches by score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  const bestMatch = matches.length > 0 ? matches[0] : undefined;
  const isDuplicate = bestMatch ? bestMatch.matchScore >= 70 : false;

  return {
    isDuplicate,
    matches: matches.slice(0, 5), // Return top 5 matches
    bestMatch
  };
}

// Merge two buyer records
export function mergeBuyerData(
  primaryBuyer: BuyerRecord,
  secondaryBuyer: BuyerRecord,
  mergeChoices?: Record<string, 'primary' | 'secondary' | 'both'>
): Partial<BuyerRecord> {
  const merged: Partial<BuyerRecord> = { ...primaryBuyer };

  // Define fields that can be merged
  const mergeableFields = [
    'name', 'email', 'phone', 'company_name', 'city', 'state', 'zip_code',
    'budget_min', 'budget_max', 'location_focus', 'asset_types', 'markets',
    'property_type_interest', 'notes', 'acquisition_timeline', 'financing_type',
    'investment_criteria', 'portfolio_summary', 'criteria_notes'
  ];

  for (const field of mergeableFields) {
    const choice = mergeChoices?.[field];
    
    if (choice === 'secondary' && secondaryBuyer[field]) {
      merged[field] = secondaryBuyer[field];
    } else if (choice === 'both') {
      // Handle array fields
      if (Array.isArray(primaryBuyer[field]) && Array.isArray(secondaryBuyer[field])) {
        const combined = [...(primaryBuyer[field] || []), ...(secondaryBuyer[field] || [])];
        merged[field] = [...new Set(combined)]; // Remove duplicates
      }
      // Handle text fields
      else if (typeof primaryBuyer[field] === 'string' && typeof secondaryBuyer[field] === 'string') {
        merged[field] = `${primaryBuyer[field]}\n\n${secondaryBuyer[field]}`;
      }
    } else if (!primaryBuyer[field] && secondaryBuyer[field]) {
      // Use secondary if primary is empty
      merged[field] = secondaryBuyer[field];
    }
  }

  // Handle priority - use higher priority
  const priorityOrder = { 'VERY HIGH': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
  const primaryPriority = priorityOrder[primaryBuyer.priority as keyof typeof priorityOrder] || 0;
  const secondaryPriority = priorityOrder[secondaryBuyer.priority as keyof typeof priorityOrder] || 0;
  
  if (secondaryPriority > primaryPriority) {
    merged.priority = secondaryBuyer.priority;
  }

  // Merge tags
  if (primaryBuyer.tags || secondaryBuyer.tags) {
    const allTags = [...(primaryBuyer.tags || []), ...(secondaryBuyer.tags || [])];
    merged.tags = [...new Set(allTags)];
  }

  // Update timestamps
  merged.updated_at = new Date().toISOString();

  return merged;
}