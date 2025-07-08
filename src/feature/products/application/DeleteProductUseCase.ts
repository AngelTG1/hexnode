// ===== src/feature/products/application/DeleteProductUseCase.ts =====
import { ProductRepository } from '../domain/ProductRepository';
import { 
    ProductNotFoundError, 
    UnauthorizedProductActionError
} from '../domain/ProductErrors';

export class DeleteProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(uuid: string, sellerId: number, isAdmin: boolean = false): Promise<void> {
        console.log('🗑️ DeleteProductUseCase - Deleting product:', uuid);

        // Verificar que el producto existe
        const product = await this.productRepository.findByUuid(uuid);
        if (!product) {
            throw new ProductNotFoundError(uuid);
        }

        // Verificar permisos: debe ser el dueño o admin
        if (!isAdmin && !product.belongsToSeller(sellerId)) {
            throw new UnauthorizedProductActionError('delete product');
        }

        // Eliminar producto
        const deleted = await this.productRepository.delete(uuid);
        if (!deleted) {
            throw new ProductNotFoundError(uuid);
        }

        console.log('✅ Product deleted successfully');
    }
}