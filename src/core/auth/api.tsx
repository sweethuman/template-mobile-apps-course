import axios from "axios";
import { baseUrl, config, withLogs } from "../index";

const loginUrl = `http://${baseUrl}/auth`;

export interface AuthProps {
  token: string;
  questionIds: number[];
}

export const login: (username?: string) => Promise<AuthProps> = (username) => {
  let res = axios.post(loginUrl, { id: username }, config);
  return withLogs(res, "login");
};
