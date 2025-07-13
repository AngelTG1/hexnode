// ===== src/feature/cart/infrastructure/controllers/CartController.ts =====
import { Request, Response } from 'express';
import { AddToCartUseCase } from '../../application/AddToCartUseCase';
import { GetCartUseCase } from '../../application/GetCartUseCase';
import { UpdateCartItemUseCase } from '../../application/UpdateCartItemUseCase';
import { RemoveFromCartUseCase } from '../../application/RemoveFromCartUseCase';
import { ClearCartUseCase } from '../../application/ClearCartUseCase';
import { GetCartSummaryUseCase } from '../../application/GetCartSummaryUseCase';
import { CartError } from '../../domain/CartErrors';

export class CartController {
    constructor(
        private readonly addToCartUseCase: AddToCartUseCase,
        private readonly getCartUseCase: GetCartUseCase,
        private readonly updateCartItemUseCase: UpdateCartItemUseCase,
        private readonly removeFromCartUseCase: RemoveFromCartUseCase,
        private readonly clearCartUseCase: ClearCartUseCase,
        private readonly getCartSummaryUseCase: GetCartSummaryUseCase
    ) {}

    // GET /api/v1/cart
    getCart = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🛒 CartController - Get cart request');

            const cart = await this.getCartUseCase.execute(req.user!.userId);

            res.status(200).json({
                status: 'success',
                data: cart.toResponse()
            });
        } catch (error) {
            console.error('💥 Error in getCart:', error);
            this.handleError(error, res);
        }
    };

    // GET /api/v1/cart/count
    getCartCount = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('📊 CartController - Get cart count request');

            const summary = await this.getCartSummaryUseCase.execute(req.user!.userId);

            res.status(200).json({
                status: 'success',
                data: summary
            });
        } catch (error) {
            console.error('💥 Error in getCartCount:', error);
            this.handleError(error, res);
        }
    };

    // POST /api/v1/cart/items
    addItem = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('➕ CartController - Add item request:', req.body);

            const { productId, quantity } = req.body;

            // Validaciones básicas
            if (!productId || !quantity) {
                res.status(400).json({
                    status: 'error',
                    message: 'productId and quantity are required',
                    code: 'MISSING_REQUIRED_FIELDS'
                });
                return;
            }

            if (typeof productId !== 'number' || typeof quantity !== 'number') {
                res.status(400).json({
                    status: 'error',
                    message: 'productId and quantity must be numbers',
                    code: 'INVALID_DATA_TYPE'
                });
                return;
            }

            if (quantity <= 0) {
                res.status(400).json({
                    status: 'error',
                    message: 'Quantity must be greater than 0',
                    code: 'INVALID_QUANTITY'
                });
                return;
            }

            const cart = await this.addToCartUseCase.execute(
                req.user!.userId,
                productId,
                quantity
            );

            res.status(200).json({
                status: 'success',
                message: 'Product added to cart successfully',
                data: cart.toResponse()
            });
        } catch (error) {
            console.error('💥 Error in addItem:', error);
            this.handleError(error, res);
        }
    };

    // PUT /api/v1/cart/items/:itemId
    updateItem = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🔄 CartController - Update item request:', req.params.itemId);

            const { itemId } = req.params;
            const { quantity } = req.body;

            // Validaciones básicas
            if (!quantity) {
                res.status(400).json({
                    status: 'error',
                    message: 'quantity is required',
                    code: 'MISSING_REQUIRED_FIELDS'
                });
                return;
            }

            if (typeof quantity !== 'number') {
                res.status(400).json({
                    status: 'error',
                    message: 'quantity must be a number',
                    code: 'INVALID_DATA_TYPE'
                });
                return;
            }

            if (quantity <= 0) {
                res.status(400).json({
                    status: 'error',
                    message: 'Quantity must be greater than 0',
                    code: 'INVALID_QUANTITY'
                });
                return;
            }

            const cart = await this.updateCartItemUseCase.execute(
                req.user!.userId,
                itemId,
                quantity
            );

            res.status(200).json({
                status: 'success',
                message: 'Cart item updated successfully',
                data: cart.toResponse()
            });
        } catch (error) {
            console.error('💥 Error in updateItem:', error);
            this.handleError(error, res);
        }
    };

    // DELETE /api/v1/cart/items/:itemId
    removeItem = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🗑️ CartController - Remove item request:', req.params.itemId);

            const { itemId } = req.params;

            const cart = await this.removeFromCartUseCase.execute(
                req.user!.userId,
                itemId
            );

            res.status(200).json({
                status: 'success',
                message: 'Item removed from cart successfully',
                data: cart.toResponse()
            });
        } catch (error) {
            console.error('💥 Error in removeItem:', error);
            this.handleError(error, res);
        }
    };

    // DELETE /api/v1/cart
    clearCart = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🗑️ CartController - Clear cart request');

            const cart = await this.clearCartUseCase.execute(req.user!.userId);

            res.status(200).json({
                status: 'success',
                message: 'Cart cleared successfully',
                data: cart.toResponse()
            });
        } catch (error) {
            console.error('💥 Error in clearCart:', error);
            this.handleError(error, res);
        }
    };

    // POST /api/v1/cart/save-for-later/:itemId
    saveForLater = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('💾 CartController - Save for later request:', req.params.itemId);

            // TODO: Implementar SaveForLaterUseCase
            res.status(501).json({
                status: 'error',
                message: 'Save for later functionality not implemented yet',
                code: 'NOT_IMPLEMENTED'
            });
        } catch (error) {
            console.error('💥 Error in saveForLater:', error);
            this.handleError(error, res);
        }
    };

    // GET /api/v1/cart/saved-items
    getSavedItems = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('📋 CartController - Get saved items request');

            // TODO: Implementar GetSavedItemsUseCase
            res.status(501).json({
                status: 'error',
                message: 'Saved items functionality not implemented yet',
                code: 'NOT_IMPLEMENTED'
            });
        } catch (error) {
            console.error('💥 Error in getSavedItems:', error);
            this.handleError(error, res);
        }
    };

    private handleError(error: any, res: Response): void {
        if (error instanceof CartError) {
            const statusCode = this.getStatusCodeForError(error.code);
            res.status(statusCode).json({
                status: 'error',
                message: error.message,
                code: error.code
            });
            return;
        }

        // Errores específicos de la aplicación
        if (error.message === 'PRODUCT_OUT_OF_STOCK') {
            res.status(409).json({
                status: 'error',
                message: 'Product is out of stock',
                code: 'PRODUCT_OUT_OF_STOCK'
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
            case 'CART_NOT_FOUND':
            case 'CART_ITEM_NOT_FOUND':
            case 'PRODUCT_NOT_FOUND':
                return 404;
            case 'UNAUTHORIZED_CART_ACTION':
                return 403;
            case 'INVALID_QUANTITY':
            case 'PRODUCT_ALREADY_IN_CART':
            case 'INVALID_CART_STATUS':
                return 400;
            case 'INSUFFICIENT_STOCK':
            case 'CART_LIMIT_EXCEEDED':
                return 409;
            default:
                return 500;
        }
    }
}