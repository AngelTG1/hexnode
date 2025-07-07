// ===== src/feature/auth/application/LoginUseCase.ts =====
import { AuthRepository } from '../domain/AuthRepository';
import { LoginRequest, AuthResponse } from '../domain/Auth'; 
import { InvalidCredentialsError } from '../domain/AuthErrors';
import { authMiddleware } from '../../../core/middleware/AuthMiddleware';
import { bcryptService } from '../../../core/service/BcryptService'; 

export class LoginUseCase {
    constructor(private readonly authRepository: AuthRepository) {}

    async execute(loginData: LoginRequest): Promise<AuthResponse> {
        console.log('🔐 LoginUseCase - Starting login process for:', loginData.email);

        // Validar campos requeridos
        if (!loginData.email?.trim() || !loginData.password?.trim()) {
            throw new InvalidCredentialsError();
        }

        // Buscar usuario por email
        const user = await this.authRepository.findUserByEmail(loginData.email.trim());
        if (!user) {
            console.log('❌ User not found for email:', loginData.email);
            throw new InvalidCredentialsError();
        }

        // Verificar contraseña usando el servicio de bcrypt
        const isPasswordValid = await bcryptService.comparePassword(loginData.password, user.password); // ← CORREGIDO: usar el método correctamente
        if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', user.email);
            throw new InvalidCredentialsError();
        }

        // Generar JWT usando el middleware centralizado
        const token = authMiddleware.generateToken({
            userId: user.id,
            uuid: user.uuid,
            email: user.email,
            role: user.role
        });

        console.log('✅ Login successful for user:', user.email);

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
}