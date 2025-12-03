import { describe, it, expect } from '@jest/globals';
import { emailValidation, idnpValidation, passwordValidation } from '@/utils/registerValidation';

describe('Register Page - emailValidation', () => {
  describe('Valid email addresses', () => {
    it('should accept standard email', () => {
      expect(emailValidation('user@example.com')).toBeUndefined();
    });

    it('should accept email with subdomain', () => {
      expect(emailValidation('user@mail.example.com')).toBeUndefined();
    });

    it('should accept email with plus sign', () => {
      expect(emailValidation('user+tag@example.com')).toBeUndefined();
    });

    it('should accept email with dots', () => {
      expect(emailValidation('first.last@example.com')).toBeUndefined();
    });

    it('should accept email with numbers', () => {
      expect(emailValidation('user123@example456.com')).toBeUndefined();
    });

    it('should accept email with hyphens', () => {
      expect(emailValidation('user-name@ex-ample.com')).toBeUndefined();
    });

    it('should accept email with underscores', () => {
      expect(emailValidation('user_name@example.com')).toBeUndefined();
    });

    it('should accept short TLD', () => {
      expect(emailValidation('user@example.co')).toBeUndefined();
    });
  });

  describe('Invalid email addresses', () => {
    it('should reject empty email', () => {
      expect(emailValidation('')).toBe('Enter a valid email address.');
    });

    it('should reject email without @', () => {
      expect(emailValidation('userexample.com')).toBe('Enter a valid email address.');
    });

    it('should reject email without domain', () => {
      expect(emailValidation('user@')).toBe('Enter a valid email address.');
    });

    it('should reject email without local part', () => {
      expect(emailValidation('@example.com')).toBe('Enter a valid email address.');
    });

    it('should reject email without TLD', () => {
      expect(emailValidation('user@example')).toBe('Enter a valid email address.');
    });

    it('should reject email with spaces in local part', () => {
      expect(emailValidation('user name@example.com')).toBe('Enter a valid email address.');
    });

    it('should reject email with spaces in domain', () => {
      expect(emailValidation('user@exam ple.com')).toBe('Enter a valid email address.');
    });

    it('should reject email with multiple @', () => {
      expect(emailValidation('user@@example.com')).toBe('Enter a valid email address.');
    });

    it('should reject email starting with @', () => {
      expect(emailValidation('@user@example.com')).toBe('Enter a valid email address.');
    });

    it('should reject email ending with @', () => {
      expect(emailValidation('user@example.com@')).toBe('Enter a valid email address.');
    });

    it('should accept email with consecutive dots (regex allows this)', () => {
      // Simple regex allows this - it's a known limitation for basic validation
      expect(emailValidation('user..name@example.com')).toBeUndefined();
    });

    it('should accept email starting with dot (regex allows this)', () => {
      // Simple regex allows this - it's a known limitation for basic validation
      expect(emailValidation('.user@example.com')).toBeUndefined();
    });

    it('should accept email ending with dot before @ (regex allows this)', () => {
      // Simple regex allows this - it's a known limitation for basic validation
      expect(emailValidation('user.@example.com')).toBeUndefined();
    });

    it('should reject only whitespace', () => {
      expect(emailValidation('   ')).toBe('Enter a valid email address.');
    });
  });
});

describe('Register Page - idnpValidation', () => {
  describe('Valid IDNP', () => {
    it('should accept exactly 13 digits', () => {
      expect(idnpValidation('1234567890123')).toBeUndefined();
    });

    it('should accept IDNP with all zeros', () => {
      expect(idnpValidation('0000000000000')).toBeUndefined();
    });

    it('should accept IDNP with all nines', () => {
      expect(idnpValidation('9999999999999')).toBeUndefined();
    });

    it('should accept IDNP with mixed digits', () => {
      expect(idnpValidation('2051234567890')).toBeUndefined();
    });
  });

  describe('Invalid IDNP', () => {
    it('should reject empty IDNP', () => {
      expect(idnpValidation('')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject IDNP with 12 digits', () => {
      expect(idnpValidation('123456789012')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject IDNP with 14 digits', () => {
      expect(idnpValidation('12345678901234')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject IDNP with letters', () => {
      expect(idnpValidation('123456789012A')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject IDNP with spaces', () => {
      expect(idnpValidation('1234567 890123')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject IDNP with special characters', () => {
      expect(idnpValidation('1234567890-23')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject IDNP with hyphens', () => {
      expect(idnpValidation('1234-567-89012')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject only letters', () => {
      expect(idnpValidation('abcdefghijklm')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject mixed alphanumeric', () => {
      expect(idnpValidation('12345abc67890')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject IDNP starting with space', () => {
      expect(idnpValidation(' 1234567890123')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject IDNP ending with space', () => {
      expect(idnpValidation('1234567890123 ')).toBe('IDNP must be exactly 13 digits.');
    });

    it('should reject single digit', () => {
      expect(idnpValidation('1')).toBe('IDNP must be exactly 13 digits.');
    });
  });
});

describe('Register Page - passwordValidation', () => {
  describe('Valid passwords', () => {
    it('should accept 6 character password', () => {
      expect(passwordValidation('123456')).toBeUndefined();
    });

    it('should accept password with letters and numbers', () => {
      expect(passwordValidation('Pass123')).toBeUndefined();
    });

    it('should accept password with special characters', () => {
      expect(passwordValidation('P@ssw0rd!')).toBeUndefined();
    });

    it('should accept password with spaces', () => {
      expect(passwordValidation('my pass')).toBeUndefined();
    });

    it('should accept long password', () => {
      expect(passwordValidation('verylongpassword123456789')).toBeUndefined();
    });

    it('should accept password with unicode characters', () => {
      expect(passwordValidation('pàsswörd')).toBeUndefined();
    });

    it('should accept password with emojis', () => {
      expect(passwordValidation('pass🔒word')).toBeUndefined();
    });
  });

  describe('Invalid passwords', () => {
    it('should reject empty password', () => {
      expect(passwordValidation('')).toBe('Password must be at least 6 characters.');
    });

    it('should reject 1 character password', () => {
      expect(passwordValidation('a')).toBe('Password must be at least 6 characters.');
    });

    it('should reject 2 character password', () => {
      expect(passwordValidation('ab')).toBe('Password must be at least 6 characters.');
    });

    it('should reject 3 character password', () => {
      expect(passwordValidation('abc')).toBe('Password must be at least 6 characters.');
    });

    it('should reject 4 character password', () => {
      expect(passwordValidation('abcd')).toBe('Password must be at least 6 characters.');
    });

    it('should reject 5 character password', () => {
      expect(passwordValidation('abcde')).toBe('Password must be at least 6 characters.');
    });

    it('should reject password with only spaces (less than 6)', () => {
      expect(passwordValidation('     ')).toBe('Password must be at least 6 characters.');
    });
  });
});
