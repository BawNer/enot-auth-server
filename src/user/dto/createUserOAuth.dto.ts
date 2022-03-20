import { IsNotEmpty } from "class-validator";

export class CreateUserOAuthDto {
  @IsNotEmpty()
  readonly service: string

  readonly bio: string

  readonly owner_id: number

  readonly accessToken: string
}