// Register page validation functions

export const emailValidation = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Enter a valid email address.";
  return undefined;
};

export const idnpValidation = (value: string) => {
  const idnpRegex = /^\d{13}$/; // IDNP must be exactly 13 digits
  if (!idnpRegex.test(value)) return "IDNP must be exactly 13 digits.";
  return undefined;
};

export const passwordValidation = (value: string) => {
  if (value.length < 6) return "Password must be at least 6 characters.";
  return undefined;
};
