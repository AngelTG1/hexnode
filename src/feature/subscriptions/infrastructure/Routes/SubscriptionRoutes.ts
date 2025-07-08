// ===== src/feature/subscriptions/infrastructure/routes/SubscriptionRoutes.ts =====
import express, { Request, Response } from 'express';
import { subscriptionController } from '../Dependencies';
import { authMiddleware } from '../../../../core/middleware/AuthMiddleware';

export const subscriptionRoutes = express.Router();

// GET /api/v1/subscriptions/plans - Ver planes disponibles (público)
subscriptionRoutes.get('/plans', async (req: Request, res: Response) => {
    try {
        await subscriptionController.getPlans(req, res);
    } catch (error) {
        console.error('Error in GET /plans route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// POST /api/v1/subscriptions/subscribe - Suscribirse a un plan (autenticado)
subscriptionRoutes.post('/subscribe', authMiddleware.authenticate, async (req: Request, res: Response) => {
    try {
        await subscriptionController.subscribe(req, res);
    } catch (error) {
        console.error('Error in POST /subscribe route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// GET /api/v1/subscriptions/my-subscription - Ver mi suscripción (autenticado)
subscriptionRoutes.get('/my-subscription', authMiddleware.authenticate, async (req: Request, res: Response) => {
    try {
        await subscriptionController.getMySubscription(req, res);
    } catch (error) {
        console.error('Error in GET /my-subscription route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// POST /api/v1/subscriptions/cancel - Cancelar suscripción (autenticado)
subscriptionRoutes.post('/cancel', authMiddleware.authenticate, async (req: Request, res: Response) => {
    try {
        await subscriptionController.cancelSubscription(req, res);
    } catch (error) {
        console.error('Error in POST /cancel route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// PUT /api/v1/subscriptions/auto-renew - Cambiar auto-renovación (autenticado)
subscriptionRoutes.put('/auto-renew', authMiddleware.authenticate, async (req: Request, res: Response) => {
    try {
        await subscriptionController.updateAutoRenew(req, res);
    } catch (error) {
        console.error('Error in PUT /auto-renew route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// GET /api/v1/subscriptions/stats - Estadísticas (solo admins)
subscriptionRoutes.get('/stats', authMiddleware.authenticate, authMiddleware.authorize(['memberships', 'admin']), async (req: Request, res: Response) => {
    try {
        await subscriptionController.getSubscriptionStats(req, res);
    } catch (error) {
        console.error('Error in GET /stats route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});