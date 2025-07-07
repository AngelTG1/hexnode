// ===== src/users/application/DeleteUserUseCase.ts =====
import { UserRepository } from '../domain/UserRepository';
import { UserNotFoundError } from '../domain/UserErrors';

export class DeleteUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(uuid: string): Promise<void> {
        console.log('🗑️ DeleteUserUseCase - Deleting user:', uuid);
        
        if (!uuid?.trim()) {
            throw new UserNotFoundError(uuid);
        }

        const deleted = await this.userRepository.delete(uuid.trim());
        if (!deleted) {
            throw new UserNotFoundError(uuid);
        }

        console.log('✅ User deleted successfully');
    }
}