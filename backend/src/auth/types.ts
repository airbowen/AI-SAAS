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
  countryCode: string;  // 添加国际区号字段
}

export interface VerifyCodeInput {
  phone: string;
  countryCode: string;  // 添加国际区号字段
  code: string;
}

export { RegisterInput, LoginInput };