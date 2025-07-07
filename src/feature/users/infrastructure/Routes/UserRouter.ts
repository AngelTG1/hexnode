// ===== src/users/infrastructure/routes/UserRoutes.ts =====
import express, { Request, Response } from 'express';
import { getAllUsersController, deleteUserController } from '../Dependencies';


export const userRoutes = express.Router();

// GET /api/v1/users - Obtener todos los usuarios  
userRoutes.get('/', async (req: Request, res: Response) => {
    try {
        await getAllUsersController.getAllUsers(req, res);
    } catch (error) {
        console.error('Error in GET route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// DELETE /api/v1/users/:uuid - Eliminar usuario
userRoutes.delete('/:uuid', async (req: Request, res: Response) => {
    try {
        await deleteUserController.deleteUser(req, res);
    } catch (error) {
        console.error('Error in DELETE route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});