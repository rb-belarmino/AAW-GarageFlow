import { authOptions } from "@/lib/auth";
import { User } from "@/core/domain/entities/User";
import { UserRepository } from "@/core/domain/repositories/UserRepository";
import { AuthenticateUserUseCase } from "@/core/use-cases/auth/AuthenticateUserUseCase";

describe("Harness: User Authentication & Route Interception Guard", () => {
  it("verifies authOptions configuration adheres to spec rules", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
    // Explicit 6 hour expiration requirement (21600 seconds)
    expect(authOptions.session?.maxAge).toBe(6 * 60 * 60);
    expect(authOptions.pages?.signIn).toBe("/login");
  });

  it("verifies NextAuth credential authorization handler authenticates valid users", async () => {
    const mockUser = {
      id: "u-mock-1",
      username: "admin",
      name: "Shop Administrator",
      role: "MANAGER",
    };

    const mockRepo: UserRepository = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    };

    const useCase = new AuthenticateUserUseCase(mockRepo, mockHasher);
    jest.spyOn(mockRepo, "findByUsername").mockResolvedValue(
      new User({
        id: mockUser.id,
        username: mockUser.username,
        passwordHash: "some-hash",
        name: mockUser.name,
        role: mockUser.role,
        isActive: true,
      })
    );

    const user = await useCase.execute({
      username: "admin",
      password: "Password123!",
    });

    expect(user).not.toBeNull();
    expect(user?.id).toBe(mockUser.id);
    expect(user?.username).toBe(mockUser.username);
    expect(user?.name).toBe(mockUser.name);
    expect(user?.role).toBe(mockUser.role);
  });

  it("verifies NextAuth JWT and Session callbacks preserve custom user attributes", async () => {
    const jwtCallback = authOptions.callbacks?.jwt;
    const sessionCallback = authOptions.callbacks?.session;

    expect(jwtCallback).toBeDefined();
    expect(sessionCallback).toBeDefined();

    const mockUser = {
      id: "u-123",
      username: "admin",
      name: "Shop Admin",
      role: "MANAGER",
    };

    // JWT token generation
    const token = await jwtCallback!({
      token: { id: "u-123", username: "admin", role: "MANAGER" },
      user: mockUser as any,
      account: null as any,
    });

    expect(token.id).toBe("u-123");
    expect(token.username).toBe("admin");
    expect(token.role).toBe("MANAGER");

    // Session projection
    const session = await sessionCallback!({
      session: {
        user: { id: "u-123", username: "admin", role: "MANAGER", name: "Shop Admin" },
        expires: "2026-08-29T18:00:00.000Z",
      },
      token,
      user: mockUser as any,
      newSession: false,
      trigger: "update",
    });

    expect((session.user as any)?.id).toBe("u-123");
    expect((session.user as any)?.username).toBe("admin");
    expect((session.user as any)?.role).toBe("MANAGER");
  });
});
