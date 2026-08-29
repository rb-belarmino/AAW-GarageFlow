# Data Model: User Authentication & Access Control

**Feature**: 002-user-authentication  
**Status**: Completed  
**Date**: 2026-08-29  

## Domain Entities & Schema

### 1. User Entity (`Domain / Core`)

Represents an authorized operator, technician, or manager in AAW GarageFlow.

```typescript
export type UserRole = "ADMIN" | "MANAGER" | "TECHNICIAN";

export interface UserProps {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: UserRole | string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly _id: string;
  private readonly _username: string;
  private readonly _passwordHash: string;
  private readonly _name: string;
  private readonly _role: string;
  private readonly _isActive: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: UserProps) {
    if (!props.username || props.username.trim().length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }
    this._id = props.id;
    this._username = props.username.trim().toLowerCase();
    this._passwordHash = props.passwordHash;
    this._name = props.name;
    this._role = props.role;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string { return this._id; }
  get username(): string { return this._username; }
  get passwordHash(): string { return this._passwordHash; }
  get name(): string { return this._name; }
  get role(): string { return this._role; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
```

### 2. Database Schema (`Prisma / Infrastructure`)

Updating `SystemUser` in `prisma/schema.prisma`:

```prisma
model SystemUser {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  name         String
  role         String   @default("TECHNICIAN")
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([username])
  @@index([role])
}
```

## Validation & Business Rules

1. **Username**:
   - Required, min 3 characters, max 50 characters.
   - Normalized to lowercase; unique across all users.
   - No email format required.
2. **Password**:
   - Required on creation/update, min 6 characters.
   - Hashed using `bcryptjs` with salt rounds >= 10.
3. **Session & Token**:
   - Signed NextAuth JWT with `maxAge: 21600` (6 hours).
   - Inactivity exceeding 6 hours causes automatic invalidation and redirect to `/login`.
