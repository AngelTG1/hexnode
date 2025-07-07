import bcrypt from 'bcrypt';
import { AuthRepository } from '../domain/AuthRepository'
import { RegisterRequest, AuthResponse } from '../domain/Auth'
import { WeakPasswordError } from '../domain/AuthErrors';
import { EmailAlreadyExistsError, InvalidEmailFormatError, RequiredFieldError } from '../../users/domain/UserErrors';
import { authMiddleware } from '../../../core/middleware/AuthMiddleware'

export class RegisterUseCase {
    constructor(private readonly authRepository: AuthRepository) {}

    async execute(registerData: RegisterRequest): Promise<AuthResponse> {
        console.log('📝 RegisterUseCase - Starting registration for:', registerData.email);

        // Validaciones
        this.validateRequiredFields(registerData);
        this.validateEmailFormat(registerData.email);
        this.validatePasswordStrength(registerData.password);

        // Verificar si el email ya existe
        const emailExists = await this.authRepository.emailExists(registerData.email);
        if (emailExists) {
            console.log('❌ Email already exists:', registerData.email);
            throw new EmailAlreadyExistsError(registerData.email);
        }

        // Encriptar contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(registerData.password, saltRounds);

        // Crear usuario
        const userData = {
            ...registerData,
            password: hashedPassword,
            role: registerData.role || 'Cliente'
        };

        const user = await this.authRepository.createUser(userData);

        // Generar JWT usando el middleware centralizado
        const token = authMiddleware.generateToken({
            userId: user.id,
            uuid: user.uuid,
            email: user.email,
            role: user.role
        });

        console.log('✅ Registration successful for user:', user.email);

        return {
            user: {
                id: user.id,
                uuid: user.uuid,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token
        };
    }

    private validateRequiredFields(registerData: RegisterRequest): void {
        if (!registerData.name?.trim()) {
            throw new RequiredFieldError('name');
        }
        if (!registerData.lastName?.trim()) {
            throw new RequiredFieldError('lastName');
        }
        if (!registerData.email?.trim()) {
            throw new RequiredFieldError('email');
        }
        if (!registerData.password?.trim()) {
            throw new RequiredFieldError('password');
        }
    }

    private validateEmailFormat(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            throw new InvalidEmailFormatError(email);
        }
    }

    private validatePasswordStrength(password: string): void {
        if (password.length < 8) {
            throw new WeakPasswordError();
        }
    }
}
