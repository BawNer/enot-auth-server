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

  @Post('activation')
  @UseGuards(AuthGuard)
  async sendActivationLink(@User('id') id: number, @User('email') email: string): Promise<string> {
    return await this.userServise.sendActiovationLink(id, email)
  }

  @Get('activation/:code')
  async activateEmail(@Param('code') code: string): Promise<UserResponseInteface> {
    const user= await this.userServise.activateEmail(code)
    return this.userServise.buildResponse(user)
  }


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
  async updateUser(@User('id') id: number, @Body('user') updateUserDto: UpdateUserDto): Promise<UserResponseInteface> {
    const user =  await this.userServise.updateUser(updateUserDto, id)
    return this.userServise.buildResponse(user)
  }
}