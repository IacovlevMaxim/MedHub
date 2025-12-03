import { describe, it, expect } from '@jest/globals';

// Confirm Email page validation
const validateEmailParam = (email: string | undefined): string | undefined => {
  if (!email) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format.";
  return undefined;
};

const validateTokenParam = (token: string | undefined): string | undefined => {
  if (!token) return "Token is required.";
  if (token.trim().length === 0) return "Token cannot be empty.";
  return undefined;
};

const validateEmailAndToken = (email: string | undefined, token: string | undefined): { 
  isValid: boolean; 
  emailError?: string; 
  tokenError?: string; 
} => {
  const emailError = validateEmailParam(email);
  const tokenError = validateTokenParam(token);
  
  return {
    isValid: !emailError && !tokenError,
    emailError,
    tokenError
  };
};

describe('Confirm Email Page - validateEmailParam', () => {
  describe('Valid emails', () => {
    it('should accept standard email', () => {
      expect(validateEmailParam('user@example.com')).toBeUndefined();
    });

    it('should accept email with subdomain', () => {
      expect(validateEmailParam('user@mail.example.com')).toBeUndefined();
    });

    it('should accept email with plus sign', () => {
      expect(validateEmailParam('user+tag@example.com')).toBeUndefined();
    });

    it('should accept email with dots', () => {
      expect(validateEmailParam('first.last@example.com')).toBeUndefined();
    });

    it('should accept email with numbers', () => {
      expect(validateEmailParam('user123@domain456.com')).toBeUndefined();
    });

    it('should accept email with hyphens', () => {
      expect(validateEmailParam('user-name@ex-ample.com')).toBeUndefined();
    });
  });

  describe('Invalid emails', () => {
    it('should reject undefined email', () => {
      expect(validateEmailParam(undefined)).toBe('Email is required.');
    });

    it('should reject empty email', () => {
      expect(validateEmailParam('')).toBe('Email is required.');
    });

    it('should reject email without @', () => {
      expect(validateEmailParam('userexample.com')).toBe('Invalid email format.');
    });

    it('should reject email without domain', () => {
      expect(validateEmailParam('user@')).toBe('Invalid email format.');
    });

    it('should reject email without local part', () => {
      expect(validateEmailParam('@example.com')).toBe('Invalid email format.');
    });

    it('should reject email without TLD', () => {
      expect(validateEmailParam('user@example')).toBe('Invalid email format.');
    });

    it('should reject email with spaces', () => {
      expect(validateEmailParam('user name@example.com')).toBe('Invalid email format.');
    });

    it('should reject email with multiple @', () => {
      expect(validateEmailParam('user@@example.com')).toBe('Invalid email format.');
    });

    it('should reject only whitespace', () => {
      expect(validateEmailParam('   ')).toBe('Invalid email format.');
    });
  });
});

describe('Confirm Email Page - validateTokenParam', () => {
  describe('Valid tokens', () => {
    it('should accept alphanumeric token', () => {
      expect(validateTokenParam('abc123xyz789')).toBeUndefined();
    });

    it('should accept token with special characters', () => {
      expect(validateTokenParam('token_with-special.chars')).toBeUndefined();
    });

    it('should accept long token', () => {
      expect(validateTokenParam('a'.repeat(100))).toBeUndefined();
    });

    it('should accept token with uppercase', () => {
      expect(validateTokenParam('ABC123XYZ')).toBeUndefined();
    });

    it('should accept Base64-like token', () => {
      expect(validateTokenParam('YWJjMTIzZGVmNDU2Z2hp')).toBeUndefined();
    });

    it('should accept JWT-like token', () => {
      expect(validateTokenParam('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0')).toBeUndefined();
    });

    it('should accept GUID-like token', () => {
      expect(validateTokenParam('123e4567-e89b-12d3-a456-426614174000')).toBeUndefined();
    });
  });

  describe('Invalid tokens', () => {
    it('should reject undefined token', () => {
      expect(validateTokenParam(undefined)).toBe('Token is required.');
    });

    it('should reject empty token', () => {
      expect(validateTokenParam('')).toBe('Token is required.');
    });

    it('should reject token with only spaces', () => {
      expect(validateTokenParam('   ')).toBe('Token cannot be empty.');
    });

    it('should reject token with only tabs', () => {
      expect(validateTokenParam('\t\t\t')).toBe('Token cannot be empty.');
    });

    it('should reject token with only newlines', () => {
      expect(validateTokenParam('\n\n\n')).toBe('Token cannot be empty.');
    });

    it('should reject mixed whitespace token', () => {
      expect(validateTokenParam('  \t\n  ')).toBe('Token cannot be empty.');
    });
  });
});

describe('Confirm Email Page - validateEmailAndToken', () => {
  describe('Both valid', () => {
    it('should validate when both email and token are valid', () => {
      const result = validateEmailAndToken('user@example.com', 'validtoken123');
      expect(result.isValid).toBe(true);
      expect(result.emailError).toBeUndefined();
      expect(result.tokenError).toBeUndefined();
    });

    it('should validate with complex email and token', () => {
      const result = validateEmailAndToken('user+tag@mail.example.com', 'abc-123_xyz.789');
      expect(result.isValid).toBe(true);
      expect(result.emailError).toBeUndefined();
      expect(result.tokenError).toBeUndefined();
    });
  });

  describe('Email invalid', () => {
    it('should fail when email is undefined', () => {
      const result = validateEmailAndToken(undefined, 'validtoken');
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBe('Email is required.');
      expect(result.tokenError).toBeUndefined();
    });

    it('should fail when email is empty', () => {
      const result = validateEmailAndToken('', 'validtoken');
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBe('Email is required.');
      expect(result.tokenError).toBeUndefined();
    });

    it('should fail when email format is invalid', () => {
      const result = validateEmailAndToken('notanemail', 'validtoken');
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBe('Invalid email format.');
      expect(result.tokenError).toBeUndefined();
    });
  });

  describe('Token invalid', () => {
    it('should fail when token is undefined', () => {
      const result = validateEmailAndToken('user@example.com', undefined);
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBeUndefined();
      expect(result.tokenError).toBe('Token is required.');
    });

    it('should fail when token is empty', () => {
      const result = validateEmailAndToken('user@example.com', '');
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBeUndefined();
      expect(result.tokenError).toBe('Token is required.');
    });

    it('should fail when token is only whitespace', () => {
      const result = validateEmailAndToken('user@example.com', '   ');
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBeUndefined();
      expect(result.tokenError).toBe('Token cannot be empty.');
    });
  });

  describe('Both invalid', () => {
    it('should fail when both are undefined', () => {
      const result = validateEmailAndToken(undefined, undefined);
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBe('Email is required.');
      expect(result.tokenError).toBe('Token is required.');
    });

    it('should fail when both are empty', () => {
      const result = validateEmailAndToken('', '');
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBe('Email is required.');
      expect(result.tokenError).toBe('Token is required.');
    });

    it('should fail when email is invalid and token is empty', () => {
      const result = validateEmailAndToken('notanemail', '');
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBe('Invalid email format.');
      expect(result.tokenError).toBe('Token is required.');
    });

    it('should fail when email is empty and token is whitespace', () => {
      const result = validateEmailAndToken('', '   ');
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBe('Email is required.');
      expect(result.tokenError).toBe('Token cannot be empty.');
    });
  });
});
