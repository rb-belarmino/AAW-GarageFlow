import { UserRepository } from "@/core/domain/repositories/UserRepository";
import { User } from "@/core/domain/entities/User";
import { prisma } from "../prisma";

export class PrismaUserRepository implements UserRepository {
  async findByUsername(username: string): Promise<User | null> {
    const raw = await prisma.systemUser.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (!raw) return null;

    return new User({
      id: raw.id,
      username: raw.username,
      passwordHash: raw.passwordHash,
      name: raw.name,
      role: raw.role,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const raw = await prisma.systemUser.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return new User({
      id: raw.id,
      username: raw.username,
      passwordHash: raw.passwordHash,
      name: raw.name,
      role: raw.role,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findAll(): Promise<User[]> {
    const rawList = await prisma.systemUser.findMany({
      orderBy: { createdAt: "desc" },
    });

    return rawList.map(
      (raw) =>
        new User({
          id: raw.id,
          username: raw.username,
          passwordHash: raw.passwordHash,
          name: raw.name,
          role: raw.role,
          isActive: raw.isActive,
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
        })
    );
  }

  async create(user: User): Promise<User> {
    const raw = await prisma.systemUser.create({
      data: {
        id: user.id,
        username: user.username,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    });

    return new User({
      id: raw.id,
      username: raw.username,
      passwordHash: raw.passwordHash,
      name: raw.name,
      role: raw.role,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async update(user: User): Promise<User> {
    const raw = await prisma.systemUser.update({
      where: { id: user.id },
      data: {
        username: user.username,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    });

    return new User({
      id: raw.id,
      username: raw.username,
      passwordHash: raw.passwordHash,
      name: raw.name,
      role: raw.role,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.systemUser.delete({
      where: { id },
    });
  }
}
