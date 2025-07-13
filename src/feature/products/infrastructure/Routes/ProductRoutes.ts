// ===== src/feature/products/infrastructure/routes/ProductRoutes.ts =====
import express, { Request, Response } from 'express';
import { productController } from '../Dependencies';
import { authMiddleware } from '../../../../core/middleware/AuthMiddleware';
import { subscriptionMiddleware } from '../../../../core/middleware/SubscriptionMiddleware';

export const productRoutes = express.Router();

// ==========================================
// ✅ RUTAS ESPECÍFICAS PRIMERO (ORDEN CRÍTICO)
// ==========================================

// GET /api/v1/products/search - Buscar productos (público)
productRoutes.get('/search', async (req: Request, res: Response) => {
    console.log('🔍 Ejecutando ruta: /search');
    try {
        await productController.searchProducts(req, res);
    } catch (error) {
        console.error('Error in search products route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// GET /api/v1/products/my-products - Ver mis productos (Premium/Admin)
productRoutes.get('/my-products',
    authMiddleware.authenticate,
    subscriptionMiddleware.requirePremium,
    async (req: Request, res: Response) => {
        console.log('✅ Ejecutando ruta: /my-products');
        console.log('🔍 Usuario autenticado:', req.user?.email);
        try {
            await productController.getMyProducts(req, res);
        } catch (error) {
            console.error('Error in GET my products route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// ==========================================
// RUTAS GENERALES
// ==========================================

// GET /api/v1/products - Ver todos los productos (público)
productRoutes.get('/', async (req: Request, res: Response) => {
    console.log('🔍 Ejecutando ruta: / (todos los productos)');
    try {
        await productController.getAllProducts(req, res);
    } catch (error) {
        console.error('Error in GET products route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// POST /api/v1/products - Crear producto (Premium/Admin)
productRoutes.post('/',
    authMiddleware.authenticate,
    subscriptionMiddleware.requirePremium,
    async (req: Request, res: Response) => {
        console.log('✅ Ejecutando ruta: POST /');
        try {
            await productController.createProduct(req, res);
        } catch (error) {
            console.error('Error in POST product route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// ==========================================
// ✅ RUTAS CON PARÁMETROS AL FINAL (CRÍTICO)
// ==========================================

// GET /api/v1/products/:uuid - Ver producto específico (público)
productRoutes.get('/:uuid', async (req: Request, res: Response) => {
    console.log('🔍 Ejecutando ruta: /:uuid con UUID:', req.params.uuid);
    try {
        await productController.getProductByUuid(req, res);
    } catch (error) {
        console.error('Error in GET product by UUID route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// PUT /api/v1/products/:uuid - Actualizar producto (Premium/Admin)
productRoutes.put('/:uuid',
    authMiddleware.authenticate,
    subscriptionMiddleware.requirePremium,
    async (req: Request, res: Response) => {
        console.log('✅ Ejecutando ruta: PUT /:uuid');
        try {
            await productController.updateProduct(req, res);
        } catch (error) {
            console.error('Error in PUT product route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// DELETE /api/v1/products/:uuid - Eliminar producto (Premium/Admin)
productRoutes.delete('/:uuid',
    authMiddleware.authenticate,
    subscriptionMiddleware.requirePremium,
    async (req: Request, res: Response) => {
        console.log('✅ Ejecutando ruta: DELETE /:uuid');
        try {
            await productController.deleteProduct(req, res);
        } catch (error) {
            console.error('Error in DELETE product route:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// ==========================================
// RUTAS ADICIONALES (opcionales)
// ==========================================

// GET /api/v1/products/categories - Obtener categorías disponibles (público)
// productRoutes.get('/categories', async (req: Request, res: Response) => {
//     try {
//         // TODO: Implementar getCategoriesController
//         res.json({
//             status: 'success',
//             data: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books']
//         });
//     } catch (error) {
//         console.error('Error in GET categories route:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Internal server error'
//         });
//     }
// });

// GET /api/v1/products/seller/:sellerId - Ver productos de un vendedor específico (público)
// productRoutes.get('/seller/:sellerId', async (req: Request, res: Response) => {
//     try {
//         // TODO: Implementar getProductsBySellerController
//         res.status(501).json({
//             status: 'error',
//             message: 'Not implemented yet'
//         });
//     } catch (error) {
//         console.error('Error in GET products by seller route:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Internal server error'
//         });
//     }
// });