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
    if (!props.passwordHash) {
      throw new Error("Password hash is required");
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Name is required");
    }

    this._id = props.id;
    this._username = props.username.trim().toLowerCase();
    this._passwordHash = props.passwordHash;
    this._name = props.name.trim();
    this._role = props.role ?? "TECHNICIAN";
    this._isActive = props.isActive !== undefined ? props.isActive : true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get name(): string {
    return this._name;
  }

  get role(): string {
    return this._role;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
