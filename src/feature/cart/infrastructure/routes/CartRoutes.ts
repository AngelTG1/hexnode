// ===== src/feature/cart/infrastructure/routes/CartRoutes.ts =====
import express, { Request, Response } from 'express';
import { cartController } from '../Dependencies';
import { authMiddleware } from '../../../../core/middleware/AuthMiddleware';

export const cartRoutes = express.Router();

// ==========================================
// TODAS LAS RUTAS DEL CARRITO REQUIEREN AUTENTICACIÓN
// ==========================================

// GET /api/v1/cart/count - Obtener solo el número de items (para badge)
cartRoutes.get('/count',
    authMiddleware.authenticate,
    async (req: Request, res: Response) => {
        console.log('📊 Ejecutando ruta: GET /count');
        try {
            await cartController.getCartCount(req, res);
        } catch (error) {
            console.error('Error in GET cart count route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// GET /api/v1/cart/saved-items - Obtener items guardados
cartRoutes.get('/saved-items',
    authMiddleware.authenticate,
    async (req: Request, res: Response) => {
        console.log('📋 Ejecutando ruta: GET /saved-items');
        try {
            await cartController.getSavedItems(req, res);
        } catch (error) {
            console.error('Error in GET saved items route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// GET /api/v1/cart - Obtener carrito del usuario autenticado
cartRoutes.get('/',
    authMiddleware.authenticate,
    async (req: Request, res: Response) => {
        console.log('🛒 Ejecutando ruta: GET / (carrito completo)');
        try {
            await cartController.getCart(req, res);
        } catch (error) {
            console.error('Error in GET cart route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// POST /api/v1/cart/items - Agregar producto al carrito
cartRoutes.post('/items',
    authMiddleware.authenticate,
    async (req: Request, res: Response) => {
        console.log('➕ Ejecutando ruta: POST /items');
        console.log('📦 Datos recibidos:', req.body);
        try {
            await cartController.addItem(req, res);
        } catch (error) {
            console.error('Error in POST cart item route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// POST /api/v1/cart/save-for-later/:itemId - Guardar item para después
cartRoutes.post('/save-for-later/:itemId',
    authMiddleware.authenticate,
    async (req: Request, res: Response) => {
        console.log('💾 Ejecutando ruta: POST /save-for-later/:itemId');
        try {
            await cartController.saveForLater(req, res);
        } catch (error) {
            console.error('Error in save for later route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// PUT /api/v1/cart/items/:itemId - Actualizar cantidad de un item
cartRoutes.put('/items/:itemId',
    authMiddleware.authenticate,
    async (req: Request, res: Response) => {
        console.log('🔄 Ejecutando ruta: PUT /items/:itemId');
        console.log('📦 Item ID:', req.params.itemId);
        console.log('📦 Datos recibidos:', req.body);
        try {
            await cartController.updateItem(req, res);
        } catch (error) {
            console.error('Error in PUT cart item route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// DELETE /api/v1/cart/items/:itemId - Eliminar item del carrito
cartRoutes.delete('/items/:itemId',
    authMiddleware.authenticate,
    async (req: Request, res: Response) => {
        console.log('🗑️ Ejecutando ruta: DELETE /items/:itemId');
        console.log('📦 Item ID:', req.params.itemId);
        try {
            await cartController.removeItem(req, res);
        } catch (error) {
            console.error('Error in DELETE cart item route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// DELETE /api/v1/cart - Vaciar carrito completamente
cartRoutes.delete('/',
    authMiddleware.authenticate,
    async (req: Request, res: Response) => {
        console.log('🗑️ Ejecutando ruta: DELETE / (vaciar carrito)');
        try {
            await cartController.clearCart(req, res);
        } catch (error) {
            console.error('Error in DELETE cart route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// ==========================================
// NOTAS PARA IMPLEMENTACIÓN
// ==========================================

/*
Para usar estas rutas en tu app principal, agrega esto en tu archivo principal de rutas:

// En tu app.ts o index.ts
import { cartRoutes } from './src/feature/cart/infrastructure/routes/CartRoutes';

// Registrar las rutas
app.use("/API/v1/cart", cartRoutes);

Esto creará las siguientes rutas:
- GET    /API/v1/cart           → Obtener carrito completo
- GET    /API/v1/cart/count     → Obtener solo conteo (para badge)
- GET    /API/v1/cart/saved-items → Obtener items guardados
- POST   /API/v1/cart/items     → Agregar producto al carrito
- PUT    /API/v1/cart/items/:id → Actualizar cantidad
- DELETE /API/v1/cart/items/:id → Eliminar item
- DELETE /API/v1/cart           → Vaciar carrito
- POST   /API/v1/cart/save-for-later/:id → Guardar para después
*/