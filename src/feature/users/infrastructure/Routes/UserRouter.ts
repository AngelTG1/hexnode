import express, { Request, Response } from 'express';
import { getAllUsersController, deleteUserController, userProfileController, userUpdateController } from '../Dependencies';
import { authMiddleware } from '../../../../core/middleware/AuthMiddleware';

export const userRoutes = express.Router();

// GET /api/v1/users - Obtener todos los usuarios (requiere autenticación y rol admin)
userRoutes.get('/', 
    authMiddleware.authenticate,
    authMiddleware.authorize(['memberships']), // Solo administradores
    async (req: Request, res: Response) => {
        try {
            await getAllUsersController.getAllUsers(req, res);
        } catch (error) {
            console.error('💥 Error in GET users route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// DELETE /api/v1/users/:uuid - Eliminar usuario (requiere autenticación y rol admin)
userRoutes.delete('/:uuid', 
    authMiddleware.authenticate,
    authMiddleware.authorize(['memberships']), // Solo administradores
    async (req: Request, res: Response) => {
        try {
            await deleteUserController.deleteUser(req, res);
        } catch (error) {
            console.error('💥 Error in DELETE user route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// GET /api/v1/users/profile - Obtener perfil del usuario autenticado
userRoutes.get('/profile', 
    authMiddleware.authenticate, 
    authMiddleware.checkTokenExpiration,
    async (req: Request, res: Response) => {
        try {
            await userProfileController.getUserProfile(req, res);
        } catch (error) {
            console.error('💥 Error in GET profile route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// PUT /api/v1/users/profile - Actualizar perfil del usuario autenticado
userRoutes.put('/profile', 
    authMiddleware.authenticate, 
    authMiddleware.checkTokenExpiration,
    async (req: Request, res: Response) => {
        try {
            await userUpdateController.updateUserProfile(req, res);
        } catch (error) {
            console.error('💥 Error in PUT profile route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);