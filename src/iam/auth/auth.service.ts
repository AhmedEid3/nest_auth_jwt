import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { HashingService } from '../../hashing/hashing.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * hash password
   * create user with hash password in db
   * generate access token
   * generate refresh token
   * create hash of refresh token
   * store hash of refresh token in db
   * return {access_token, refresh_token}
   */
  async signUp(authDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(authDto);

      return this.generateAccessAndRefreshTokens(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('username exist');
      }
      throw error;
    }
  }

  /**
   * find user by name
   * compare password
   * generate access token
   * generate refresh token
   * return {access_token, refresh_token}
   */
  async signIn(authDto: SignInDto) {
    const user = await this.usersService.findOneByName(authDto.name);

    const isPasswordMatched = await this.hashingService.compare(
      authDto.password,
      user.password,
    );

    if (!isPasswordMatched) throw new BadRequestException('Password incorrect');

    return this.generateAccessAndRefreshTokens(user);
  }

  /**
   * find user
   * compare hash refresh token
   * generate access token
   * generate refresh token
   * return {access_token, refresh_token}
   */
  async refreshTokens(activeUser: ActiveUserData) {
    const user = await this.usersService.findOneId(activeUser.sub);

    if (!user.hashRT || !activeUser.refreshToken)
      throw new BadRequestException('user logged out');

    const isRefreshTokenMatched = await this.hashingService.compare(
      activeUser.refreshToken,
      user.hashRT,
    );

    if (!isRefreshTokenMatched)
      throw new BadRequestException('RefreshToken stolen');

    return this.generateAccessAndRefreshTokens(user);
  }

  async logout(user: ActiveUserData) {
    await this.usersService.updateRefreshToken(user.sub, '');
    return;
  }

  private async generateAccessToken(payload: ActiveUserData): Promise<string> {
    const oneHour = 3600;

    return this.jwtService.signAsync(payload, {
      expiresIn: oneHour,
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  private async generateRefreshToken(payload: ActiveUserData): Promise<string> {
    const oneWeek = 3600 * 24 * 7;

    return this.jwtService.signAsync(payload, {
      expiresIn: oneWeek,
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    });
  }

  private async generateAccessAndRefreshTokens(user: User) {
    const payload: ActiveUserData = {
      sub: user.id,
      username: user.name,
      roles: user.roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}
