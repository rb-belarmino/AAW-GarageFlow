import { UserRepository } from "@/core/domain/repositories/UserRepository";
import { User } from "@/core/domain/entities/User";

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
