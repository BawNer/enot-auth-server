import { Body, Controller, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { User } from "./decorators/user.decorator";
import { CreateUserDto } from "./dto/createUser.dto";
import { LoginUserDto } from "./dto/loginUser.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { AuthGuard } from "./guards/auth.guard";
import { UserResponseInteface } from "./types/responseUser.inteface";
import { UserEntity } from "./user.entity";
import UserService from "./user.service";

@Controller('user')
export default class UserController {
  constructor (
    private readonly userServise: UserService
  ) {}

  @Get('activation')
  @UseGuards(AuthGuard)
  async getActiovationLink(@User('id') id: number): Promise<string> {
    return await this.userServise.generateActivationLink(id)
  }

  // @Get('activation/:code') activate email service here


  @Post('registration')
  @UsePipes(new ValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInteface> {
    const user = await this.userServise.createUser(createUserDto)
    return this.userServise.buildResponse(user)
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async loginUser(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseInteface> {
    const user = await this.userServise.loginUser(loginUserDto)
    return this.userServise.buildResponse(user)
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateUser(@User('id') id: number, @Body('user') updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return await this.userServise.updateUser(updateUserDto, id)
  }
}