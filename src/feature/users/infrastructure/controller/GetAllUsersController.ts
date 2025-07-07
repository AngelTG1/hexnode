import { Request, Response } from "express";
import { GetAllUsersUseCase } from "../../application/GetAllUsersUseCase";
import { UserError } from "../../domain/UserErrors";

export class GetAllUserController {
    constructor(
        private readonly getAllUsersUseCase: GetAllUsersUseCase
    ) { }

    getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('📋 UserController - Get all users request');

            const users = await this.getAllUsersUseCase.execute();
            const usersResponse = users.map(user => user.toResponse());

            res.status(200).json({
                status: 'success',
                data: usersResponse,
                count: usersResponse.length
            });
        } catch (error) {
            console.error('💥 Error in getAllUsers:', error);
            this.handleError(error, res);
        }
    };

    private handleError(error: any, res: Response): void {
        if (error instanceof UserError) {
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
            case 'EMAIL_ALREADY_EXISTS':
                return 409;
            case 'USER_NOT_FOUND':
                return 404;
            case 'INVALID_EMAIL_FORMAT':
            case 'REQUIRED_FIELD_MISSING':
                return 400;
            default:
                return 500;
        }
    }
} 