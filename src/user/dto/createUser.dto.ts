import { IsNotEmpty } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  readonly username: string

  @IsNotEmpty()
  readonly login: string

  @IsNotEmpty()
  readonly password: string

  @IsNotEmpty()
  readonly email: string

  readonly bio: string

  readonly yandexId: string

  readonly vkId: string
}