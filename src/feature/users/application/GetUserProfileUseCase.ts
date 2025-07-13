import { User } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';
import { UserNotFoundError } from '../domain/UserErrors';

export class GetUserProfileUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(userId: number): Promise<User> {
        console.log('👤 GetUserProfileUseCase - Getting user profile for ID:', userId);
        
        if (!userId || userId <= 0) {
            throw new UserNotFoundError(userId?.toString() || 'invalid');
        }
        
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UserNotFoundError(userId.toString());
        }

        console.log('✅ User profile retrieved successfully');
        return user;
    }
}