import { UserRepository } from "@/core/domain/repositories/UserRepository";
import { BcryptPasswordHasher } from "@/infrastructure/security/BcryptPasswordHasher";
import { User, UserRole } from "@/core/domain/entities/User";
import crypto from "crypto";

export interface CreateUserDTO {
  username: string;
  password: string;
  name: string;
  role: UserRole | string;
  isActive?: boolean;
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: BcryptPasswordHasher = new BcryptPasswordHasher()
  ) {}

  async execute(dto: CreateUserDTO): Promise<User> {
    if (!dto.username || dto.username.trim().length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }
    if (!dto.password || dto.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error("Full name is required");
    }

    const normalizedUsername = dto.username.trim().toLowerCase();
    const existing = await this.userRepository.findByUsername(normalizedUsername);
    if (existing) {
      throw new Error("Username is already taken");
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = new User({
      id: crypto.randomUUID(),
      username: normalizedUsername,
      passwordHash,
      name: dto.name.trim(),
      role: dto.role ?? "TECHNICIAN",
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    return this.userRepository.create(user);
  }
}
