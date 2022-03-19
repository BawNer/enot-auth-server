import { UserType } from "./user.type";

export interface UserResponseInteface {
  user: UserType & { accessToken: string }
}