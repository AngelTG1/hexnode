import { User } from '../../users/domain/User';

export interface AuthRepository {
    findUserByEmail(email: string): Promise<User | null>;
    createUser(userData: any): Promise<User>;
    emailExists(email: string): Promise<boolean>;
}