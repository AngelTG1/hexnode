import express, { Request, Response } from 'express';
import { authController } from '../Dependencies';

export const authRoutes = express.Router();

authRoutes.post('/login', async (req: Request, res: Response) => {
    try {
        await authController.login(req, res);
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

authRoutes.post('/register', async (req: Request, res: Response) => {
    try {
        await authController.register(req, res);
    } catch (error) {
        console.error('Error in register route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});