// Confirm email page validation functions

export const validateEmailParam = (email: string | undefined): string | undefined => {
  if (!email) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format.";
  return undefined;
};

export const validateTokenParam = (token: string | undefined): string | undefined => {
  if (!token) return "Token is required.";
  if (token.trim().length === 0) return "Token cannot be empty.";
  return undefined;
};

export const validateEmailAndToken = (email: string | undefined, token: string | undefined): { 
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
