import { UserRepository } from "@/core/domain/repositories/UserRepository";
import { BcryptPasswordHasher } from "@/infrastructure/security/BcryptPasswordHasher";
import { User, UserRole } from "@/core/domain/entities/User";

export interface UpdateUserDTO {
  id: string;
  name?: string;
  role?: UserRole | string;
  password?: string;
  isActive?: boolean;
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: BcryptPasswordHasher = new BcryptPasswordHasher()
  ) {}

  async execute(dto: UpdateUserDTO): Promise<User> {
    const existing = await this.userRepository.findById(dto.id);
    if (!existing) {
      throw new Error("User not found");
    }

    let passwordHash = existing.passwordHash;
    if (dto.password && dto.password.trim().length > 0) {
      if (dto.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      passwordHash = await this.passwordHasher.hash(dto.password);
    }

    const updatedUser = new User({
      id: existing.id,
      username: existing.username,
      name: dto.name?.trim() || existing.name,
      role: dto.role || existing.role,
      passwordHash,
      isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    return this.userRepository.update(updatedUser);
  }
}
