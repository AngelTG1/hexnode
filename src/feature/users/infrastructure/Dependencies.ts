import { GetAllUsersUseCase } from '../application/GetAllUsersUseCase';
import { DeleteUserUseCase } from '../application/DeleteUserUseCase';
import { DeleteUserController } from './controller/DeleteUserController';
import { GetAllUserController } from './controller/GetAllUsersController';
import { MysqlUserRepository } from './Repositories/MysqlUserRepositoty';

// Repository (única instancia)
const userRepository = new MysqlUserRepository();

// Use Cases
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);

// Controllers
const deleteUserController = new DeleteUserController(
    deleteUserUseCase
);

const getAllUsersController = new GetAllUserController(
    getAllUsersUseCase
)

// Exports
export {
    deleteUserController,
    getAllUsersController,
    getAllUsersUseCase,
    deleteUserUseCase,
    userRepository
};