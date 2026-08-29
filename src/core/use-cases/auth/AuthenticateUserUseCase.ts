import { UserRepository } from "@/core/domain/repositories/UserRepository";
import { PasswordHasher, BcryptPasswordHasher } from "@/infrastructure/security/BcryptPasswordHasher";
import { User } from "@/core/domain/entities/User";

export interface AuthenticateUserDTO {
  username?: string;
  password?: string;
}

export class AuthenticateUserUseCase {
  private readonly passwordHasher: PasswordHasher;

  constructor(
    private readonly userRepository: UserRepository,
    passwordHasher?: PasswordHasher
  ) {
    this.passwordHasher = passwordHasher ?? new BcryptPasswordHasher();
  }

  async execute(dto: AuthenticateUserDTO): Promise<User | null> {
    if (!dto.username || !dto.password) {
      return null;
    }

    const normalizedUsername = dto.username.trim().toLowerCase();
    const user = await this.userRepository.findByUsername(normalizedUsername);

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
