// ===== src/feature/products/infrastructure/controllers/ProductController.ts =====
import { Request, Response } from 'express';
import { CreateProductUseCase } from '../../application/CreateProductUseCase';
import { GetAllProductsUseCase } from '../../application/GetAllProductsUseCase';
import { GetProductByUuidUseCase } from '../../application/GetProductByUuidUseCase';
import { GetMyProductsUseCase } from '../../application/GetMyProductsUseCase';
import { UpdateProductUseCase } from '../../application/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../application/DeleteProductUseCase';
import { SearchProductsUseCase } from '../../application/SearchProductsUseCase';
import { ProductError } from '../../domain/ProductErrors';
import { ProductStatus } from '../../domain/Product';

export class ProductController {
    constructor(
        private readonly createProductUseCase: CreateProductUseCase,
        private readonly getAllProductsUseCase: GetAllProductsUseCase,
        private readonly getProductByUuidUseCase: GetProductByUuidUseCase,
        private readonly getMyProductsUseCase: GetMyProductsUseCase,
        private readonly updateProductUseCase: UpdateProductUseCase,
        private readonly deleteProductUseCase: DeleteProductUseCase,
        private readonly searchProductsUseCase: SearchProductsUseCase
    ) { }

    // POST /api/v1/products
    createProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('📦 ProductController - Create product request:', req.body);

            const productData = {
                ...req.body,
                sellerId: req.user!.userId // Usuario autenticado
            };

            const product = await this.createProductUseCase.execute(productData);

            res.status(201).json({
                status: 'success',
                message: 'Product created successfully',
                data: product.toResponse()
            });
        } catch (error) {
            console.error('💥 Error in createProduct:', error);
            this.handleError(error, res);
        }
    };

    // GET /api/v1/products
    getAllProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('📋 ProductController - Get all products request');

            const filters = this.extractFiltersFromQuery(req.query);
            const result = await this.getAllProductsUseCase.execute(filters);

            res.status(200).json({
                status: 'success',
                data: {
                    products: result.products.map(product => product.toResponse()),
                    pagination: result.pagination,
                    filters: result.filters
                }
            });
        } catch (error) {
            console.error('💥 Error in getAllProducts:', error);
            this.handleError(error, res);
        }
    };

    // GET /api/v1/products/search?q=query
    searchProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🔍 ProductController - Search products request');

            const query = req.query.q as string || '';
            const filters = this.extractFiltersFromQuery(req.query);

            const result = await this.searchProductsUseCase.execute(query, filters);

            res.status(200).json({
                status: 'success',
                data: {
                    products: result.products.map(product => product.toResponse()),
                    searchQuery: result.searchQuery,
                    pagination: result.pagination,
                    suggestions: result.suggestions
                }
            });
        } catch (error) {
            console.error('💥 Error in searchProducts:', error);
            this.handleError(error, res);
        }
    };

    // GET /api/v1/products/my-products
    getMyProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('👤 ProductController - Get my products request');

            // ✅ LOGS DE DEBUG
            console.log('🔍 Requesting products for seller ID:', req.user?.userId);
            console.log('🔍 Seller ID type:', typeof req.user?.userId);

            const filters = this.extractFiltersFromQuery(req.query);
            console.log('🔍 Applied filters:', filters);

            const result = await this.getMyProductsUseCase.execute(req.user!.userId, filters);

            console.log('🔍 Found products count:', result.products.length);
            console.log('🔍 Seller stats:', result.stats);

            // ✅ SI HAY PRODUCTOS, MOSTRAR EL PRIMERO
            if (result.products.length > 0) {
                console.log('🔍 First product sample:', {
                    uuid: result.products[0].uuid,
                    name: result.products[0].name,
                    sellerId: result.products[0].sellerId,
                    status: result.products[0].status
                });
            }

            res.status(200).json({
                status: 'success',
                data: {
                    products: result.products.map(product => product.toResponse()),
                    stats: result.stats,
                    pagination: result.pagination
                }
            });
        } catch (error) {
            console.error('💥 Error in getMyProducts:', error);
            this.handleError(error, res);
        }
    };

    // GET /api/v1/products/:uuid
    getProductByUuid = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🔍 ProductController - Get product by UUID:', req.params.uuid);

            const product = await this.getProductByUuidUseCase.execute(req.params.uuid);

            res.status(200).json({
                status: 'success',
                data: product.toResponse()
            });
        } catch (error) {
            console.error('💥 Error in getProductByUuid:', error);
            this.handleError(error, res);
        }
    };

    // PUT /api/v1/products/:uuid
    updateProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🔄 ProductController - Update product:', req.params.uuid);

            const product = await this.updateProductUseCase.execute(
                req.params.uuid,
                req.user!.userId,
                req.body
            );

            res.status(200).json({
                status: 'success',
                message: 'Product updated successfully',
                data: product.toResponse()
            });
        } catch (error) {
            console.error('💥 Error in updateProduct:', error);
            this.handleError(error, res);
        }
    };

    // DELETE /api/v1/products/:uuid
    deleteProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🗑️ ProductController - Delete product:', req.params.uuid);

            const isAdmin = req.user!.role === 'memberships';
            await this.deleteProductUseCase.execute(
                req.params.uuid,
                req.user!.userId,
                isAdmin
            );

            res.status(200).json({
                status: 'success',
                message: 'Product deleted successfully'
            });
        } catch (error) {
            console.error('💥 Error in deleteProduct:', error);
            this.handleError(error, res);
        }
    };

    private extractFiltersFromQuery(query: any) {
        // Import or define ProductStatus enum/type if not already imported
        // import { ProductStatus } from '../../domain/Product';

        // List of valid statuses, adjust as per your ProductStatus enum
        const validStatuses = ['ACTIVE', 'INACTIVE', 'SOLD_OUT', 'DELETED']; // Example values

        let status: any = query.status;
        if (status && !validStatuses.includes(status)) {
            status = undefined;
        }

        return {
            category: query.category as string,
            minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
            maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
            status: status as ProductStatus | undefined,
            page: query.page ? parseInt(query.page) : undefined,
            limit: query.limit ? parseInt(query.limit) : undefined,
            search: query.search as string
        };
    }

    private handleError(error: any, res: Response): void {
        if (error instanceof ProductError) {
            const statusCode = this.getStatusCodeForError(error.code);
            res.status(statusCode).json({
                status: 'error',
                message: error.message,
                code: error.code
            });
            return;
        }

        // Errores específicos de la aplicación
        if (error.message === 'SELLER_PRODUCT_LIMIT_REACHED') {
            res.status(403).json({
                status: 'error',
                message: 'Product creation limit reached. Upgrade to Premium for unlimited products.',
                code: 'PRODUCT_LIMIT_REACHED'
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
            case 'PRODUCT_NOT_FOUND':
                return 404;
            case 'UNAUTHORIZED_PRODUCT_ACTION':
                return 403;
            case 'INVALID_PRODUCT_DATA':
            case 'PRODUCT_REQUIRED_FIELD_MISSING':
            case 'INVALID_PRICE':
            case 'INVALID_STOCK_QUANTITY':
            case 'PRODUCT_NAME_TOO_LONG':
            case 'TOO_MANY_IMAGES':
                return 400;
            case 'INSUFFICIENT_STOCK':
                return 409;
            default:
                return 500;
        }
    }
}