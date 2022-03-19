import { IsNotEmpty } from "class-validator";

export class UpdateUserDto {
  @IsNotEmpty()
  readonly password: string

  readonly email: string

  readonly bio: string

  readonly newPassword: string
}