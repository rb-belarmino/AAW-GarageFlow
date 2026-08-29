import { AuthenticateUserUseCase } from "@/core/use-cases/auth/AuthenticateUserUseCase";
import { UserRepository } from "@/core/domain/repositories/UserRepository";
import { BcryptPasswordHasher } from "@/infrastructure/security/BcryptPasswordHasher";
import { User } from "@/core/domain/entities/User";

describe("AuthenticateUserUseCase", () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordHasher: jest.Mocked<BcryptPasswordHasher>;
  let useCase: AuthenticateUserUseCase;

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

    useCase = new AuthenticateUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  it("authenticates valid username and password returning User entity", async () => {
    const user = new User({
      id: "u-1",
      username: "admin",
      passwordHash: "hashed-pw",
      name: "Shop Admin",
      role: "MANAGER",
      isActive: true,
    });

    mockUserRepository.findByUsername.mockResolvedValue(user);
    mockPasswordHasher.compare.mockResolvedValue(true);

    const result = await useCase.execute({
      username: "admin",
      password: "Password123!",
    });

    expect(result).not.toBeNull();
    expect(result?.username).toBe("admin");
    expect(result?.name).toBe("Shop Admin");
    expect(result?.role).toBe("MANAGER");
  });

  it("rejects when username does not exist", async () => {
    mockUserRepository.findByUsername.mockResolvedValue(null);

    const result = await useCase.execute({
      username: "nonexistent",
      password: "Password123!",
    });

    expect(result).toBeNull();
    expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
  });

  it("rejects when password does not match", async () => {
    const user = new User({
      id: "u-1",
      username: "admin",
      passwordHash: "hashed-pw",
      name: "Shop Admin",
      role: "MANAGER",
      isActive: true,
    });

    mockUserRepository.findByUsername.mockResolvedValue(user);
    mockPasswordHasher.compare.mockResolvedValue(false);

    const result = await useCase.execute({
      username: "admin",
      password: "wrongpassword",
    });

    expect(result).toBeNull();
  });

  it("rejects when user is inactive", async () => {
    const user = new User({
      id: "u-1",
      username: "disableduser",
      passwordHash: "hashed-pw",
      name: "Inactive Tech",
      role: "TECHNICIAN",
      isActive: false,
    });

    mockUserRepository.findByUsername.mockResolvedValue(user);

    const result = await useCase.execute({
      username: "disableduser",
      password: "Password123!",
    });

    expect(result).toBeNull();
  });
});
