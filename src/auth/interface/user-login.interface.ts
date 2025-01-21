export interface UserPayload {
  sub: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  access_token: string;
}
