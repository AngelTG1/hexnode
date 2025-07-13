import { GetAllUsersUseCase } from '../application/GetAllUsersUseCase';
import { DeleteUserUseCase } from '../application/DeleteUserUseCase';
import { GetUserProfileUseCase } from '../application/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../application/UpdateUserProfileUseCase';

import { DeleteUserController } from './controller/DeleteUserController';
import { GetAllUserController } from './controller/GetAllUsersController';
import { UserProfileController } from './controller/UserProfileController';
import { UserUpdateController } from './controller/UserUpdateController';
import { MysqlUserRepository } from './Repositories/MysqlUserRepositoty';

// Repository (única instancia)
const userRepository = new MysqlUserRepository();

// Use Cases
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);

// Controllers
const deleteUserController = new DeleteUserController(deleteUserUseCase);
const getAllUsersController = new GetAllUserController(getAllUsersUseCase);
const userProfileController = new UserProfileController(getUserProfileUseCase);
const userUpdateController = new UserUpdateController(updateUserProfileUseCase);

// Exports
export {
    deleteUserController,
    getAllUsersController,
    userProfileController,
    userUpdateController,
    getAllUsersUseCase,
    deleteUserUseCase,
    getUserProfileUseCase,
    updateUserProfileUseCase,
    userRepository
};
