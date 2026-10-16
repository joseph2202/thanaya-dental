export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }
  return { valid: true, message: '' };
};

export const validatePhone = (phone: string): boolean => {
  const re = /^07\d{9}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const registerUser = (name: string, email: string, phone: string, password: string): { user: User | null; error: string } => {
  // التحقق من الاسم
  if (name.trim().length < 3) {
    return { user: null, error: 'الاسم يجب أن يكون 3 أحرف على الأقل' };
  }

  // التحقق من البريد
  if (!validateEmail(email)) {
    return { user: null, error: 'البريد الإلكتروني غير صحيح' };
  }

  // التحقق من الهاتف
  if (!validatePhone(phone)) {
    return { user: null, error: 'رقم الهاتف يجب أن يبدأ بـ 07 ويتكون من 10 أرقام' };
  }

  // التحقق من كلمة المرور
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return { user: null, error: passwordCheck.message };
  }

  const users = getUsers();
  
  // تحقق من وجود البريد
  if (users.find((u) => u.email === email)) {
    return { user: null, error: 'البريد الإلكتروني مسجل مسبقاً' };
  }

  const newUser: User = {
    id: 'user-' + Date.now().toString().slice(-8),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    createdAt: new Date().toISOString(),
  };

  // حفظ المستخدم
  users.push(newUser);
  localStorage.setItem('thanaya-users', JSON.stringify(users));
  
  // حفظ كلمة المرور (مشفرة بشكل بسيط - للتبسيط)
  const passwords = JSON.parse(localStorage.getItem('thanaya-passwords') || '{}');
  passwords[email.toLowerCase().trim()] = btoa(password); // تشفير بسيط
  localStorage.setItem('thanaya-passwords', JSON.stringify(passwords));

  // تسجيل دخول تلقائي
  localStorage.setItem('thanaya-current-user', JSON.stringify(newUser));
  
  return { user: newUser, error: '' };
};

export const loginUser = (email: string, password: string): { user: User | null; error: string } => {
  // التحقق من الحقول الفارغة
  if (!email.trim() || !password.trim()) {
    return { user: null, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
  }

  // التحقق من صيغة البريد
  if (!validateEmail(email)) {
    return { user: null, error: 'البريد الإلكتروني غير صحيح' };
  }

  const users = getUsers();
  const passwords = JSON.parse(localStorage.getItem('thanaya-passwords') || '{}');
  
  const user = users.find((u) => u.email === email.toLowerCase().trim());
  
  if (!user) {
    return { user: null, error: 'البريد الإلكتروني غير مسجل' };
  }

  // التحقق من كلمة المرور
  const savedPassword = passwords[email.toLowerCase().trim()];
  if (!savedPassword || atob(savedPassword) !== password) {
    return { user: null, error: 'كلمة المرور غير صحيحة' };
  }

  localStorage.setItem('thanaya-current-user', JSON.stringify(user));
  return { user, error: '' };
};

export const logoutUser = () => {
  localStorage.removeItem('thanaya-current-user');
};

export const getCurrentUser = (): User | null => {
  const saved = localStorage.getItem('thanaya-current-user');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

export const getUsers = (): User[] => {
  const saved = localStorage.getItem('thanaya-users');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};
