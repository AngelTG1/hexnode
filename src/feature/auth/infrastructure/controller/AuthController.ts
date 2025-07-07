import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/LoginUseCase';
import { RegisterUseCase } from '../../application/RegisterUseCase';
import { AuthError } from '../../domain/AuthErrors';
import { UserError } from '../../../users/domain/UserErrors';

export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase
    ) {}

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🔐 AuthController - Login request for:', req.body.email);
            
            const authResponse = await this.loginUseCase.execute(req.body);
            
            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: authResponse
            });
        } catch (error) {
            console.error('💥 Error in login:', error);
            this.handleError(error, res);
        }
    };

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('📝 AuthController - Register request for:', req.body.email);
            
            const authResponse = await this.registerUseCase.execute(req.body);
            
            res.status(201).json({
                status: 'success',
                message: 'Registration successful',
                data: authResponse
            });
        } catch (error) {
            console.error('💥 Error in register:', error);
            this.handleError(error, res);
        }
    };

    private handleError(error: any, res: Response): void {
        if (error instanceof AuthError || error instanceof UserError) {
            const statusCode = this.getStatusCodeForError(error.code);
            res.status(statusCode).json({
                status: 'error',
                message: error.message,
                code: error.code
            });
            return;
        }

        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }

    private getStatusCodeForError(code: string): number {
        switch (code) {
            case 'INVALID_CREDENTIALS':
                return 401;
            case 'TOKEN_EXPIRED':
            case 'INVALID_TOKEN':
                return 401;
            case 'EMAIL_ALREADY_EXISTS':
                return 409;
            case 'INVALID_EMAIL_FORMAT':
            case 'REQUIRED_FIELD_MISSING':
            case 'WEAK_PASSWORD':
                return 400;
            default:
                return 500;
        }
    }
}