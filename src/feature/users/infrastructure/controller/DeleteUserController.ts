import { Request, Response } from "express";
import { DeleteUserUseCase } from "../../application/DeleteUserUseCase";
import { UserError } from "../../domain/UserErrors";

export class DeleteUserController {
    constructor(
        private readonly deleteUserUseCase: DeleteUserUseCase
    ) {}

        deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🗑️ UserController - Delete user:', req.params.uuid);
            
            await this.deleteUserUseCase.execute(req.params.uuid);
            
            res.status(200).json({
                status: 'success',
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('💥 Error in deleteUser:', error);
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