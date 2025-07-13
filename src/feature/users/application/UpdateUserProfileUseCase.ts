import { User } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';
import { UserNotFoundError, EmailAlreadyExistsError, RequiredFieldError } from '../domain/UserErrors';

export interface UpdateUserProfileData {
    name?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}

export class UpdateUserProfileUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(userId: number, updateData: UpdateUserProfileData): Promise<User> {
        console.log('🔄 UpdateUserProfileUseCase - Updating user profile for ID:', userId);
        console.log('📝 Update data:', updateData);
        
        if (!userId || userId <= 0) {
            throw new UserNotFoundError(userId?.toString() || 'invalid');
        }

        // Validar que exista el usuario
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new UserNotFoundError(userId.toString());
        }

        // Validar email si se está actualizando
        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await this.userRepository.emailExists(updateData.email);
            if (emailExists) {
                throw new EmailAlreadyExistsError(updateData.email);
            }
        }

        // Validar campos requeridos (no pueden estar vacíos si se envían)
        if (updateData.name !== undefined && updateData.name.trim() === '') {
            throw new RequiredFieldError('name');
        }
        if (updateData.lastName !== undefined && updateData.lastName.trim() === '') {
            throw new RequiredFieldError('lastName');
        }

        const updatedUser = await this.userRepository.update(existingUser.uuid, updateData);
        if (!updatedUser) {
            throw new UserNotFoundError(userId.toString());
        }

        console.log('✅ User profile updated successfully');
        return updatedUser;
    }
}