import { AuthRepository } from "../../domain/AuthRepository";
import { User } from "../../../users/domain/User";
import { MysqlUserRepository } from "../../../users/infrastructure/Repositories/MysqlUserRepositoty";

export class AuthUserRepository implements AuthRepository {
    constructor(private readonly userRepository: MysqlUserRepository) {}

    async findUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findByEmail(email);
    }

    async createUser(userData: any): Promise<User> {
        return await this.userRepository.create(userData);
    }

    async emailExists(email: string): Promise<boolean> {
        return await this.userRepository.emailExists(email);
    }

    
}