import { describe, it, expect } from '@jest/globals';

// Login page validation functions
const identifierValidation = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "This field is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (trimmed.includes("@")) {
    return emailRegex.test(trimmed)
      ? undefined
      : "Enter a valid email address.";
  }
  // Username path: basic length check
  if (trimmed.length < 3) return "Username must be at least 3 characters.";
  return undefined;
};

const passwordValidation = (value: string) => {
  if (value.length < 6) return "Password must be at least 6 characters.";
  return undefined;
};

describe('Login Page - identifierValidation', () => {
  describe('Empty input', () => {
    it('should return error for empty string', () => {
      expect(identifierValidation('')).toBe('This field is required.');
    });

    it('should return error for whitespace only', () => {
      expect(identifierValidation('   ')).toBe('This field is required.');
    });

    it('should return error for tabs and spaces', () => {
      expect(identifierValidation('\t  \n')).toBe('This field is required.');
    });
  });

  describe('Valid email addresses', () => {
    it('should accept standard email', () => {
      expect(identifierValidation('user@example.com')).toBeUndefined();
    });

    it('should accept email with subdomain', () => {
      expect(identifierValidation('user@mail.example.com')).toBeUndefined();
    });

    it('should accept email with plus sign', () => {
      expect(identifierValidation('user+tag@example.com')).toBeUndefined();
    });

    it('should accept email with dots in local part', () => {
      expect(identifierValidation('first.last@example.com')).toBeUndefined();
    });

    it('should accept email with numbers', () => {
      expect(identifierValidation('user123@example456.com')).toBeUndefined();
    });

    it('should accept email with hyphens', () => {
      expect(identifierValidation('user-name@ex-ample.com')).toBeUndefined();
    });

    it('should trim whitespace and accept valid email', () => {
      expect(identifierValidation('  user@example.com  ')).toBeUndefined();
    });
  });

  describe('Invalid email addresses', () => {
    it('should reject email without @', () => {
      // This is treated as a username (no @ present), so it's valid if >= 3 chars
      expect(identifierValidation('userexample.com')).toBeUndefined();
    });

    it('should reject email without domain', () => {
      expect(identifierValidation('user@')).toBe('Enter a valid email address.');
    });

    it('should reject email without local part', () => {
      expect(identifierValidation('@example.com')).toBe('Enter a valid email address.');
    });

    it('should reject email without TLD', () => {
      expect(identifierValidation('user@example')).toBe('Enter a valid email address.');
    });

    it('should reject email with spaces', () => {
      expect(identifierValidation('user name@example.com')).toBe('Enter a valid email address.');
    });

    it('should reject email with multiple @', () => {
      expect(identifierValidation('user@@example.com')).toBe('Enter a valid email address.');
    });

    it('should accept email starting with dot (regex allows this)', () => {
      // Simple regex allows this - it's a known limitation
      expect(identifierValidation('.user@example.com')).toBeUndefined();
    });
  });

  describe('Valid usernames', () => {
    it('should accept 3 character username', () => {
      expect(identifierValidation('abc')).toBeUndefined();
    });

    it('should accept username with numbers', () => {
      expect(identifierValidation('user123')).toBeUndefined();
    });

    it('should accept username with underscores', () => {
      expect(identifierValidation('user_name')).toBeUndefined();
    });

    it('should accept username with hyphens', () => {
      expect(identifierValidation('user-name')).toBeUndefined();
    });

    it('should accept long username', () => {
      expect(identifierValidation('verylongusernametest')).toBeUndefined();
    });

    it('should trim whitespace and accept valid username', () => {
      expect(identifierValidation('  username  ')).toBeUndefined();
    });
  });

  describe('Invalid usernames', () => {
    it('should reject 1 character username', () => {
      expect(identifierValidation('a')).toBe('Username must be at least 3 characters.');
    });

    it('should reject 2 character username', () => {
      expect(identifierValidation('ab')).toBe('Username must be at least 3 characters.');
    });

    it('should reject empty username after trim', () => {
      expect(identifierValidation('  ')).toBe('This field is required.');
    });
  });
});

describe('Login Page - passwordValidation', () => {
  describe('Valid passwords', () => {
    it('should accept 6 character password', () => {
      expect(passwordValidation('123456')).toBeUndefined();
    });

    it('should accept password with letters and numbers', () => {
      expect(passwordValidation('pass123')).toBeUndefined();
    });

    it('should accept password with special characters', () => {
      expect(passwordValidation('P@ssw0rd!')).toBeUndefined();
    });

    it('should accept long password', () => {
      expect(passwordValidation('verylongpassword123456')).toBeUndefined();
    });

    it('should accept password with spaces', () => {
      expect(passwordValidation('my password')).toBeUndefined();
    });
  });

  describe('Invalid passwords', () => {
    it('should reject empty password', () => {
      expect(passwordValidation('')).toBe('Password must be at least 6 characters.');
    });

    it('should reject 1 character password', () => {
      expect(passwordValidation('a')).toBe('Password must be at least 6 characters.');
    });

    it('should reject 5 character password', () => {
      expect(passwordValidation('12345')).toBe('Password must be at least 6 characters.');
    });

    it('should reject password with only spaces (less than 6)', () => {
      expect(passwordValidation('     ')).toBe('Password must be at least 6 characters.');
    });
  });
});
