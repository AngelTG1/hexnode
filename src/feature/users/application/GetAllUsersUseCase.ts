// ===== src/users/application/GetAllUsersUseCase.ts =====
import { User } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';

export class GetAllUsersUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(): Promise<User[]> {
        console.log('📋 GetAllUsersUseCase - Fetching all users');
        const users = await this.userRepository.findAll();
        console.log(`✅ Found ${users.length} users`);
        return users;
    }
}