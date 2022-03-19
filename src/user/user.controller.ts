import { Controller, Get, Param } from "@nestjs/common";
import UserService from "./user.service";

@Controller()
export default class UserController {
  constructor (
    private readonly userServise: UserService
  ) {}

  @Get('user/:id/activation')
  async getActiovationLink(@Param('id') id: number): Promise<string> {
    return await this.userServise.generateActivationLink(id)
  }
}