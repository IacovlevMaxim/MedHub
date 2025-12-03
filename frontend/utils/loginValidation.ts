// Login page validation functions

export const identifierValidation = (value: string) => {
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

export const passwordValidation = (value: string) => {
  if (value.length < 6) return "Password must be at least 6 characters.";
  return undefined;
};
