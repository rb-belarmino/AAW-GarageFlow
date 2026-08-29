import { CreateUserUseCase } from "@/core/use-cases/auth/CreateUserUseCase";
import { ListUsersUseCase } from "@/core/use-cases/auth/ListUsersUseCase";
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
