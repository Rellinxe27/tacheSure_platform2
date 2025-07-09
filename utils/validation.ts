// utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Côte d'Ivoire phone number validation
  const phoneRegex = /^(\+225|225)?[0-9]{8,10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTaskData = (taskData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!taskData.title || taskData.title.trim().length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères');
  }

  if (!taskData.description || taskData.description.trim().length < 10) {
    errors.push('La description doit contenir au moins 10 caractères');
  }

  if (!taskData.category) {
    errors.push('Veuillez sélectionner une catégorie');
  }

  if (taskData.budget_min && taskData.budget_max && taskData.budget_min > taskData.budget_max) {
    errors.push('Le budget minimum ne peut pas être supérieur au budget maximum');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};