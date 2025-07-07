// ===== src/users/domain/UserRepository.ts =====
import { User, CreateUserData } from './User';

export interface UserRepository {
    findAll(): Promise<User[]>;
    findById(id: number): Promise<User | null>;
    findByUuid(uuid: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    //create(userData: CreateUserData): Promise<User>;
    update(uuid: string, userData: Partial<CreateUserData>): Promise<User | null>;
    delete(uuid: string): Promise<boolean>;
    emailExists(email: string): Promise<boolean>;
}