export interface ILogin {
  email: string;
  password: string;
}
export interface ILoginData {
  success: boolean;
  data: {
    _id: string;
    full_name: string;
    email: string;
    contact: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}
export interface ILoginReturn {
  login: boolean;
  token: string;
  success: boolean;
}
export interface ILoginVerify {
  token: string;
}

export interface ISelectUserReturn {
  token: string;
  data: SelectUser[];
}
interface SelectUser {
  id: string;
  email: string;
  connected: number;
}
export interface ISelectUserSend {
  full_name: string;
  email: string;
  contact: string;
}
