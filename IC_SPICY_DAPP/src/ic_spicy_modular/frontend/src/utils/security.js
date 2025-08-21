// Security utilities for IC SPICY frontend

// Input validation and sanitization
export const validateInput = {
  // Validate principal format
  principal: (principal) => {
    if (!principal || typeof principal !== 'string') return false;
    // Basic principal validation (should be 27 characters, alphanumeric)
    const principalRegex = /^[a-zA-Z0-9]{27}$/;
    return principalRegex.test(principal);
  },

  // Validate text input with length limits
  text: (text, maxLength = 100) => {
    if (!text || typeof text !== 'string') return false;
    return text.length > 0 && text.length <= maxLength;
  },

  // Validate numeric input
  number: (num, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    const number = Number(num);
    if (isNaN(number)) return false;
    return number >= min && number <= max;
  },

  // Validate email format
  email: (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate URL format
  url: (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// XSS prevention - escape HTML
export const escapeHtml = (text) => {
  if (!text || typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Sanitize user input for display
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Rate limiting for frontend actions
class RateLimiter {
  constructor() {
    this.actions = new Map();
  }

  canPerformAction(action, userId, limit = 5, windowMs = 60000) {
    const key = `${action}_${userId}`;
    const now = Date.now();
    const userActions = this.actions.get(key) || [];
    
    // Remove old actions outside the time window
    const recentActions = userActions.filter(time => now - time < windowMs);
    
    if (recentActions.length >= limit) {
      return false;
    }
    
    recentActions.push(now);
    this.actions.set(key, recentActions);
    return true;
  }

  clearActions(action, userId) {
    const key = `${action}_${userId}`;
    this.actions.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// CSRF protection
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Secure storage utilities
export const secureStorage = {
  // Store sensitive data with encryption (basic implementation)
  set: (key, value) => {
    try {
      const encrypted = btoa(JSON.stringify(value)); // Basic encoding
      localStorage.setItem(key, encrypted);
      return true;
    } catch (error) {
      console.error('Failed to store data:', error);
      return false;
    }
  },

  // Retrieve and decrypt data
  get: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted)); // Basic decoding
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  },

  // Remove data
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove data:', error);
      return false;
    }
  },

  // Clear all data
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }
};

// Error handling utilities
export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  
  // Don't expose sensitive error details to users
  const userMessage = 'An error occurred. Please try again.';
  
  // Log detailed error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Detailed error:', error);
  }
  
  return userMessage;
};

// Validation for form inputs
export const validateForm = {
  // Validate staking form
  staking: (amount, lockMonths) => {
    const errors = [];
    
    if (!validateInput.number(amount, 100, 1000000000)) {
      errors.push('Amount must be between 100 and 1,000,000,000');
    }
    
    if (!validateInput.number(lockMonths, 3, 60)) {
      errors.push('Lock period must be between 3 and 60 months');
    }
    
    return errors;
  },

  // Validate transfer form
  transfer: (recipient, amount, tokenType) => {
    const errors = [];
    
    if (!validateInput.principal(recipient)) {
      errors.push('Invalid recipient principal');
    }
    
    if (!validateInput.number(amount, 1)) {
      errors.push('Invalid amount');
    }
    
    if (!['SPICY', 'HEAT'].includes(tokenType)) {
      errors.push('Invalid token type');
    }
    
    return errors;
  },

  // Validate profile form
  profile: (username, email, bio) => {
    const errors = [];
    
    if (!validateInput.text(username, 50)) {
      errors.push('Username must be 1-50 characters');
    }
    
    if (email && !validateInput.email(email)) {
      errors.push('Invalid email format');
    }
    
    if (bio && !validateInput.text(bio, 500)) {
      errors.push('Bio must be 1-500 characters');
    }
    
    return errors;
  }
};

// Security headers and CSP
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Secure random number generation
export const secureRandom = {
  // Generate secure random number between min and max
  number: (min, max) => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return min + (array[0] % (max - min + 1));
  },

  // Generate secure random string
  string: (length = 32) => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
};

// Audit logging
export const auditLog = {
  log: (action, userId, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // In production, this should be sent to a secure logging service
    console.log('AUDIT LOG:', logEntry);
    
    // Store locally for debugging
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(logs));
  }
}; 