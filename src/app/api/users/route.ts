import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaUserRepository } from "@/infrastructure/database/repositories/PrismaUserRepository";
import { ListUsersUseCase } from "@/core/use-cases/auth/ListUsersUseCase";
import { CreateUserUseCase } from "@/core/use-cases/auth/CreateUserUseCase";
import { UpdateUserUseCase } from "@/core/use-cases/auth/UpdateUserUseCase";
import { DeleteUserUseCase } from "@/core/use-cases/auth/DeleteUserUseCase";

const userRepository = new PrismaUserRepository();
const listUsersUseCase = new ListUsersUseCase(userRepository);
const createUserUseCase = new CreateUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Manager role required." }, { status: 403 });
    }

    const users = await listUsersUseCase.execute();
    const safeUsers = users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

    return NextResponse.json(safeUsers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Manager role required." }, { status: 403 });
    }

    const body = await request.json();
    const createdUser = await createUserUseCase.execute({
      username: body.username,
      password: body.password,
      name: body.name,
      role: body.role || "TECHNICIAN",
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json(
      {
        id: createdUser.id,
        username: createdUser.username,
        name: createdUser.name,
        role: createdUser.role,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Manager role required." }, { status: 403 });
    }

    const body = await request.json();
    const updatedUser = await updateUserUseCase.execute({
      id: body.id,
      name: body.name,
      role: body.role,
      password: body.password,
      isActive: body.isActive,
    });

    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Manager role required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await deleteUserUseCase.execute(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 400 });
  }
}
