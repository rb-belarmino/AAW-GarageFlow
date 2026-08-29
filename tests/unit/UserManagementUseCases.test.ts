import { CreateUserUseCase } from "@/core/use-cases/auth/CreateUserUseCase";
import { ListUsersUseCase } from "@/core/use-cases/auth/ListUsersUseCase";
import { UpdateUserUseCase } from "@/core/use-cases/auth/UpdateUserUseCase";
import { DeleteUserUseCase } from "@/core/use-cases/auth/DeleteUserUseCase";
import { UserRepository } from "@/core/domain/repositories/UserRepository";
import { BcryptPasswordHasher } from "@/infrastructure/security/BcryptPasswordHasher";
import { User } from "@/core/domain/entities/User";

describe("User Management Use Cases", () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordHasher: jest.Mocked<BcryptPasswordHasher>;

  beforeEach(() => {
    mockUserRepository = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<BcryptPasswordHasher>;
  });

  describe("CreateUserUseCase", () => {
    it("creates and hashes password for a new valid user", async () => {
      const useCase = new CreateUserUseCase(mockUserRepository, mockPasswordHasher);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockPasswordHasher.hash.mockResolvedValue("secure-hash-123");
      mockUserRepository.create.mockImplementation(async (u) => u);

      const created = await useCase.execute({
        username: "tech2",
        password: "Password123!",
        name: "Carlos Mechanic",
        role: "TECHNICIAN",
      });

      expect(created.username).toBe("tech2");
      expect(created.name).toBe("Carlos Mechanic");
      expect(created.passwordHash).toBe("secure-hash-123");
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it("throws error when username is already taken", async () => {
      const useCase = new CreateUserUseCase(mockUserRepository, mockPasswordHasher);
      mockUserRepository.findByUsername.mockResolvedValue(
        new User({
          id: "u-existing",
          username: "admin",
          passwordHash: "hash",
          name: "Existing Admin",
          role: "MANAGER",
        })
      );

      await expect(
        useCase.execute({
          username: "admin",
          password: "Password123!",
          name: "Duplicate Admin",
          role: "MANAGER",
        })
      ).rejects.toThrow("Username is already taken");
    });
  });

  describe("UpdateUserUseCase", () => {
    it("updates user fields and hashes new password if provided", async () => {
      const useCase = new UpdateUserUseCase(mockUserRepository, mockPasswordHasher);
      const existing = new User({
        id: "u-1",
        username: "tech1",
        passwordHash: "old-hash",
        name: "Old Name",
        role: "TECHNICIAN",
      });

      mockUserRepository.findById.mockResolvedValue(existing);
      mockPasswordHasher.hash.mockResolvedValue("new-hash-456");
      mockUserRepository.update.mockImplementation(async (u) => u);

      const updated = await useCase.execute({
        id: "u-1",
        name: "New Name",
        role: "MANAGER",
        password: "NewPassword123!",
      });

      expect(updated.name).toBe("New Name");
      expect(updated.role).toBe("MANAGER");
      expect(updated.passwordHash).toBe("new-hash-456");
      expect(mockUserRepository.update).toHaveBeenCalled();
    });
  });

  describe("DeleteUserUseCase", () => {
    it("deletes user when user is not self", async () => {
      const useCase = new DeleteUserUseCase(mockUserRepository);
      mockUserRepository.findById.mockResolvedValue(
        new User({
          id: "u-2",
          username: "tech1",
          passwordHash: "hash",
          name: "Tech One",
          role: "TECHNICIAN",
        })
      );

      await useCase.execute("u-2", "u-1");
      expect(mockUserRepository.delete).toHaveBeenCalledWith("u-2");
    });

    it("prevents self deletion", async () => {
      const useCase = new DeleteUserUseCase(mockUserRepository);
      mockUserRepository.findById.mockResolvedValue(
        new User({
          id: "u-1",
          username: "admin",
          passwordHash: "hash",
          name: "Admin",
          role: "MANAGER",
        })
      );

      await expect(useCase.execute("u-1", "u-1")).rejects.toThrow(
        "You cannot delete your own active administrator account"
      );
    });
  });

  describe("ListUsersUseCase", () => {
    it("returns list of all users from repository", async () => {
      const useCase = new ListUsersUseCase(mockUserRepository);
      const userList = [
        new User({
          id: "u-1",
          username: "admin",
          passwordHash: "hash1",
          name: "Admin User",
          role: "MANAGER",
        }),
      ];
      mockUserRepository.findAll.mockResolvedValue(userList);

      const result = await useCase.execute();
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe("admin");
    });
  });
});
