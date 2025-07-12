/**
 * Input Sanitization Utilities
 * Provides robust validation and sanitization for user-generated content
 */

// XSS prevention patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
];

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(;|\-\-|\/\*|\*\/)/g,
  /(\b(OR|AND)\b.*[=<>])/gi,
];

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone validation regex (US format)
const PHONE_REGEX = /^(\+1|1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

// URL validation regex
const URL_REGEX = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;

/**
 * Sanitizes text input by removing potentially dangerous content
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Remove SQL injection patterns
  SQL_INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '***');
  });
  
  // HTML encode remaining special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
}

/**
 * Validates and sanitizes email addresses
 */
export function validateEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, sanitized: '', error: 'Email is required' };
  }
  
  const sanitized = email.trim().toLowerCase();
  
  if (sanitized.length > 254) {
    return { isValid: false, sanitized, error: 'Email is too long' };
  }
  
  if (!EMAIL_REGEX.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Invalid email format' };
  }
  
  return { isValid: true, sanitized };
}

/**
 * Validates and sanitizes phone numbers
 */
export function validatePhone(phone: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, sanitized: '', error: 'Phone number is required' };
  }
  
  const sanitized = phone.replace(/[^\d\+\-\.\s\(\)]/g, '').trim();
  
  if (!PHONE_REGEX.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Invalid phone number format' };
  }
  
  // Normalize to standard format
  const normalized = sanitized.replace(/[^\d]/g, '');
  const formatted = normalized.length === 11 && normalized.startsWith('1') 
    ? normalized.substring(1) 
    : normalized;
  
  return { 
    isValid: true, 
    sanitized: `(${formatted.substring(0, 3)}) ${formatted.substring(3, 6)}-${formatted.substring(6, 10)}` 
  };
}

/**
 * Validates URLs
 */
export function validateUrl(url: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, sanitized: '', error: 'URL is required' };
  }
  
  const sanitized = url.trim();
  
  if (!URL_REGEX.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Invalid URL format' };
  }
  
  return { isValid: true, sanitized };
}

/**
 * Validates and sanitizes numeric input
 */
export function validateNumber(
  value: string | number, 
  min?: number, 
  max?: number
): { isValid: boolean; sanitized: number; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, sanitized: 0, error: 'Number is required' };
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, sanitized: 0, error: 'Invalid number format' };
  }
  
  if (min !== undefined && num < min) {
    return { isValid: false, sanitized: num, error: `Number must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { isValid: false, sanitized: num, error: `Number must be at most ${max}` };
  }
  
  return { isValid: true, sanitized: num };
}

/**
 * Validates text length and content
 */
export function validateText(
  text: string, 
  minLength = 0, 
  maxLength = 1000, 
  allowHtml = false
): { isValid: boolean; sanitized: string; error?: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: false, sanitized: '', error: 'Text is required' };
  }
  
  let sanitized = allowHtml ? text.trim() : sanitizeText(text);
  
  if (sanitized.length < minLength) {
    return { 
      isValid: false, 
      sanitized, 
      error: `Text must be at least ${minLength} characters long` 
    };
  }
  
  if (sanitized.length > maxLength) {
    return { 
      isValid: false, 
      sanitized: sanitized.substring(0, maxLength), 
      error: `Text must be no more than ${maxLength} characters long` 
    };
  }
  
  return { isValid: true, sanitized };
}

/**
 * Validates array input
 */
export function validateArray(
  arr: any[], 
  maxItems = 100, 
  itemValidator?: (item: any) => boolean
): { isValid: boolean; sanitized: any[]; error?: string } {
  if (!Array.isArray(arr)) {
    return { isValid: false, sanitized: [], error: 'Must be an array' };
  }
  
  if (arr.length > maxItems) {
    return { 
      isValid: false, 
      sanitized: arr.slice(0, maxItems), 
      error: `Array cannot have more than ${maxItems} items` 
    };
  }
  
  if (itemValidator) {
    const invalidItems = arr.filter(item => !itemValidator(item));
    if (invalidItems.length > 0) {
      return { 
        isValid: false, 
        sanitized: arr.filter(itemValidator), 
        error: 'Some items in the array are invalid' 
      };
    }
  }
  
  return { isValid: true, sanitized: arr };
}

/**
 * Comprehensive form validation
 */
export function validateForm(data: Record<string, any>, rules: Record<string, any>): {
  isValid: boolean;
  sanitized: Record<string, any>;
  errors: Record<string, string>;
} {
  const sanitized: Record<string, any> = {};
  const errors: Record<string, string> = {};
  let isValid = true;
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field} is required`;
      isValid = false;
      continue;
    }
    
    if (!value && !rule.required) {
      sanitized[field] = value;
      continue;
    }
    
    switch (rule.type) {
      case 'email':
        const emailResult = validateEmail(value);
        sanitized[field] = emailResult.sanitized;
        if (!emailResult.isValid) {
          errors[field] = emailResult.error || `Invalid ${field}`;
          isValid = false;
        }
        break;
        
      case 'phone':
        const phoneResult = validatePhone(value);
        sanitized[field] = phoneResult.sanitized;
        if (!phoneResult.isValid) {
          errors[field] = phoneResult.error || `Invalid ${field}`;
          isValid = false;
        }
        break;
        
      case 'url':
        const urlResult = validateUrl(value);
        sanitized[field] = urlResult.sanitized;
        if (!urlResult.isValid) {
          errors[field] = urlResult.error || `Invalid ${field}`;
          isValid = false;
        }
        break;
        
      case 'number':
        const numberResult = validateNumber(value, rule.min, rule.max);
        sanitized[field] = numberResult.sanitized;
        if (!numberResult.isValid) {
          errors[field] = numberResult.error || `Invalid ${field}`;
          isValid = false;
        }
        break;
        
      case 'text':
        const textResult = validateText(value, rule.minLength, rule.maxLength, rule.allowHtml);
        sanitized[field] = textResult.sanitized;
        if (!textResult.isValid) {
          errors[field] = textResult.error || `Invalid ${field}`;
          isValid = false;
        }
        break;
        
      case 'array':
        const arrayResult = validateArray(value, rule.maxItems, rule.itemValidator);
        sanitized[field] = arrayResult.sanitized;
        if (!arrayResult.isValid) {
          errors[field] = arrayResult.error || `Invalid ${field}`;
          isValid = false;
        }
        break;
        
      default:
        sanitized[field] = sanitizeText(String(value));
    }
  }
  
  return { isValid, sanitized, errors };
}