import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { UserResponseInteface } from "./types/responseUser.inteface";
import { UserEntity } from "./user.entity";
import UserService from "./user.service";

@Controller()
export default class UserController {
  constructor (
    private readonly userServise: UserService
  ) {}

  @Get('user/:code/activation')
  async getActiovationLink(@Param('code') code: string): Promise<string> {
    return await this.userServise.generateActivationLink(code)
  }

  @Post('user')
  @UsePipes(new ValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInteface> {
    const user = await this.userServise.createUser(createUserDto)
    return this.userServise.buildResponse(user)
  }
}