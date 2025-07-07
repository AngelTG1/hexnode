import { LoginUseCase } from "../application/LoginUseCase";
import { RegisterUseCase } from "../application/RegisterUseCase";
import { AuthController } from "./controller/AuthController";
import { AuthUserRepository } from "./Repositories/AuthUserRepository";
import { MysqlUserRepository } from "../../users/infrastructure/Repositories/MysqlUserRepositoty";

const userRepository = new MysqlUserRepository();
const authRepository = new AuthUserRepository(userRepository);

const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);

const authController = new AuthController(loginUseCase, registerUseCase);

export {
    authController,
    loginUseCase,
    registerUseCase,
    authRepository,
    userRepository
};

