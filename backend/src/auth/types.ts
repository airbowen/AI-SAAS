interface RegisterInput {
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export interface SendCodeInput {
  phone: string;
}

export interface VerifyCodeInput {
  phone: string;
  code: string;
}

export { RegisterInput, LoginInput };