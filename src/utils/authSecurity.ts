/**
 * Advanced Authentication Security Utilities
 * Provides comprehensive security features for authentication flows
 */

// Rate limiting for authentication attempts
interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

class AuthSecurityManager {
  private rateLimitMap = new Map<string, RateLimitEntry>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly RESET_WINDOW = 60 * 60 * 1000; // 1 hour

  /**
   * Enhanced password validation with comprehensive security checks
   */
  validatePassword(password: string): {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong' | 'very_strong';
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
      suggestions.push('Consider using 12+ characters for better security');
    }

    // Character complexity checks
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[@$!%*?&]/.test(password);
    const hasExtendedSpecialChars = /[#^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

    if (!hasLowercase) errors.push('Password must contain lowercase letters');
    if (!hasUppercase) errors.push('Password must contain uppercase letters');
    if (!hasNumbers) errors.push('Password must contain numbers');
    if (!hasSpecialChars && !hasExtendedSpecialChars) {
      errors.push('Password must contain special characters');
    }

    score += [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars || hasExtendedSpecialChars].filter(Boolean).length;

    // Common patterns check
    const commonPatterns = [
      /123/,
      /abc/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /(\w)\1{2,}/, // repeated characters
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      errors.push('Password contains common patterns');
      suggestions.push('Avoid common words, sequences, or repeated characters');
      score -= 1;
    }

    // Dictionary word check (basic)
    const commonWords = ['password', 'admin', 'user', 'login', 'welcome', 'hello', 'world', 'test'];
    if (commonWords.some(word => password.toLowerCase().includes(word))) {
      errors.push('Password contains common words');
      suggestions.push('Avoid using dictionary words');
      score -= 1;
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' | 'very_strong' = 'weak';
    if (score >= 8) strength = 'very_strong';
    else if (score >= 6) strength = 'strong';
    else if (score >= 4) strength = 'medium';

    return {
      isValid: errors.length === 0,
      strength,
      errors,
      suggestions
    };
  }

  /**
   * Enhanced email validation with domain checks
   */
  validateEmail(email: string): {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
      return { isValid: false, errors, suggestions };
    }

    // Length validation
    if (email.length > 254) {
      errors.push('Email address is too long');
    }

    // Local part validation (before @)
    const [localPart, domain] = email.split('@');
    if (localPart.length > 64) {
      errors.push('Email local part is too long');
    }

    // Domain validation
    if (domain) {
      // Check for valid domain format
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(domain)) {
        errors.push('Invalid domain format');
      }

      // Check for suspicious domains (basic list)
      const suspiciousDomains = ['temp-mail.org', '10minutemail.com', 'guerrillamail.com'];
      if (suspiciousDomains.some(suspicious => domain.toLowerCase().includes(suspicious))) {
        suggestions.push('Consider using a permanent email address');
      }
    }

    // Check for common typos in popular domains
    const popularDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domainLower = domain?.toLowerCase();
    popularDomains.forEach(popular => {
      if (domainLower && this.calculateLevenshteinDistance(domainLower, popular) === 1) {
        suggestions.push(`Did you mean ${popular}?`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }

  /**
   * Rate limiting for authentication attempts
   */
  checkRateLimit(identifier: string): {
    allowed: boolean;
    attemptsRemaining: number;
    blockedUntil?: Date;
  } {
    const now = Date.now();
    const entry = this.rateLimitMap.get(identifier);

    if (!entry) {
      this.rateLimitMap.set(identifier, { attempts: 0, lastAttempt: now });
      return { allowed: true, attemptsRemaining: this.MAX_ATTEMPTS };
    }

    // Reset if window has passed
    if (now - entry.lastAttempt > this.RESET_WINDOW) {
      this.rateLimitMap.set(identifier, { attempts: 0, lastAttempt: now });
      return { allowed: true, attemptsRemaining: this.MAX_ATTEMPTS };
    }

    // Check if currently blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        attemptsRemaining: 0,
        blockedUntil: new Date(entry.blockedUntil)
      };
    }

    // Check if max attempts reached
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      const blockedUntil = now + this.BLOCK_DURATION;
      this.rateLimitMap.set(identifier, {
        ...entry,
        blockedUntil,
        lastAttempt: now
      });
      return {
        allowed: false,
        attemptsRemaining: 0,
        blockedUntil: new Date(blockedUntil)
      };
    }

    return {
      allowed: true,
      attemptsRemaining: this.MAX_ATTEMPTS - entry.attempts
    };
  }

  /**
   * Record an authentication attempt
   */
  recordAttempt(identifier: string, success: boolean): void {
    const now = Date.now();
    const entry = this.rateLimitMap.get(identifier);

    if (success) {
      // Clear rate limiting on successful auth
      this.rateLimitMap.delete(identifier);
      return;
    }

    if (!entry) {
      this.rateLimitMap.set(identifier, { attempts: 1, lastAttempt: now });
    } else {
      this.rateLimitMap.set(identifier, {
        ...entry,
        attempts: entry.attempts + 1,
        lastAttempt: now
      });
    }
  }

  /**
   * Sanitize input data to prevent XSS and injection attacks
   */
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  }

  /**
   * Generate a secure session identifier
   */
  generateSecureSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): {
    isValid: boolean;
    formatted: string;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check length
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      errors.push('Phone number must be between 10-15 digits');
    }
    
    // Basic format validation
    const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Invalid phone number format');
    }
    
    // Format for display (basic US format)
    let formatted = cleanPhone;
    if (cleanPhone.length === 10) {
      formatted = `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      formatted = `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
    }
    
    return {
      isValid: errors.length === 0,
      formatted,
      errors
    };
  }

  /**
   * Calculate Levenshtein distance for typo detection
   */
  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Clean up old rate limit entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now - entry.lastAttempt > this.RESET_WINDOW) {
        this.rateLimitMap.delete(key);
      }
    }
  }
}

// Export singleton instance
export const authSecurity = new AuthSecurityManager();

// Export types
export type PasswordValidation = ReturnType<typeof AuthSecurityManager.prototype.validatePassword>;
export type EmailValidation = ReturnType<typeof AuthSecurityManager.prototype.validateEmail>;
export type RateLimitCheck = ReturnType<typeof AuthSecurityManager.prototype.checkRateLimit>;
export type PhoneValidation = ReturnType<typeof AuthSecurityManager.prototype.validatePhoneNumber>;

// Cleanup old entries every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    authSecurity.cleanup();
  }, 60 * 60 * 1000);
}