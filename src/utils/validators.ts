export const isValidPassword = (password: string): boolean => {
  const minLength = 8;
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return password.length >= minLength && pattern.test(password);
};