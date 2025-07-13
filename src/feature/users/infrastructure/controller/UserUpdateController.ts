import { Request, Response } from "express";
import { UpdateUserProfileUseCase, UpdateUserProfileData } from "../../application/UpdateUserProfileUseCase";
import { UserError } from "../../domain/UserErrors";

export class UserUpdateController {
    constructor(
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase
    ) {}

    updateUserProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🔄 UserUpdateController - Update user profile for ID:', req.user?.userId);
            console.log('📝 Update data received:', req.body);
            
            if (!req.user?.userId) {
                res.status(401).json({
                    status: 'error',
                    message: 'Authentication required',
                    code: 'AUTHENTICATION_REQUIRED'
                });
                return;
            }

            // Validar que al menos un campo esté presente
            const { name, lastName, email, phone } = req.body;
            if (!name && !lastName && !email && phone === undefined) {
                res.status(400).json({
                    status: 'error',
                    message: 'At least one field must be provided for update',
                    code: 'NO_UPDATE_FIELDS'
                });
                return;
            }

            const updateData: UpdateUserProfileData = {
                name: name?.trim(),
                lastName: lastName?.trim(),
                email: email?.trim(),
                phone: phone?.trim()
            };

            // Filtrar campos undefined y vacíos
            const filteredData = Object.fromEntries(
                Object.entries(updateData).filter(([_, value]) => 
                    value !== undefined && value !== null && value !== ''
                )
            ) as UpdateUserProfileData;

            const updatedUser = await this.updateUserProfileUseCase.execute(
                req.user.userId, 
                filteredData
            );
            
            res.status(200).json({
                status: 'success',
                data: updatedUser.toResponse(),
                message: 'User profile updated successfully'
            });
        } catch (error) {
            console.error('💥 Error in updateUserProfile:', error);
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
            case 'AUTHENTICATION_REQUIRED':
                return 401;
            default:
                return 500;
        }
    }
}
