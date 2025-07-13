import { Request, Response } from "express";
import { GetUserProfileUseCase } from "../../application/GetUserProfileUseCase";
import { UserError } from "../../domain/UserErrors";

export class UserProfileController {
    constructor(
        private readonly getUserProfileUseCase: GetUserProfileUseCase
    ) {}

    getUserProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('👤 UserProfileController - Get user profile for ID:', req.user?.userId);
            
            if (!req.user?.userId) {
                res.status(401).json({
                    status: 'error',
                    message: 'Authentication required',
                    code: 'AUTHENTICATION_REQUIRED'
                });
                return;
            }

            const user = await this.getUserProfileUseCase.execute(req.user.userId);
            
            res.status(200).json({
                status: 'success',
                data: user.toResponse(),
                message: 'User profile retrieved successfully'
            });
        } catch (error) {
            console.error('💥 Error in getUserProfile:', error);
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
            case 'USER_NOT_FOUND':
                return 404;
            case 'AUTHENTICATION_REQUIRED':
                return 401;
            default:
                return 500;
        }
    }
}