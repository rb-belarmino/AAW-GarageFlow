import { UserRepository } from "@/core/domain/repositories/UserRepository";

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, currentUserId?: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new Error("User not found");
    }

    if (currentUserId && currentUserId === id) {
      throw new Error("You cannot delete your own active administrator account");
    }

    await this.userRepository.delete(id);
  }
}
