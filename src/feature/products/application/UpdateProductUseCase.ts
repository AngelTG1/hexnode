// ===== src/feature/products/application/UpdateProductUseCase.ts =====
import { ProductRepository } from '../domain/ProductRepository';
import { Product, UpdateProductData } from '../domain/Product';
import { 
    ProductNotFoundError, 
    UnauthorizedProductActionError,
    InvalidPriceError,
    InvalidStockQuantityError,
    ProductNameTooLongError,
    TooManyImagesError
} from '../domain/ProductErrors';

export class UpdateProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(uuid: string, sellerId: number, updateData: UpdateProductData): Promise<Product> {
        console.log('🔄 UpdateProductUseCase - Updating product:', uuid);

        // Verificar que el producto existe
        const existingProduct = await this.productRepository.findByUuid(uuid);
        if (!existingProduct) {
            throw new ProductNotFoundError(uuid);
        }

        // Verificar que el producto pertenece al vendedor (excepto si es admin)
        if (!existingProduct.belongsToSeller(sellerId)) {
            throw new UnauthorizedProductActionError('update product');
        }

        // Validar datos de actualización
        this.validateUpdateData(updateData);

        // Actualizar producto
        const updatedProduct = await this.productRepository.update(uuid, updateData);
        if (!updatedProduct) {
            throw new ProductNotFoundError(uuid);
        }

        console.log('✅ Product updated successfully:', updatedProduct.name);
        return updatedProduct;
    }

    private validateUpdateData(updateData: UpdateProductData): void {
        // Validar precio si se proporciona
        if (updateData.price !== undefined && updateData.price <= 0) {
            throw new InvalidPriceError(updateData.price);
        }

        // Validar stock si se proporciona
        if (updateData.stockQuantity !== undefined && updateData.stockQuantity < 0) {
            throw new InvalidStockQuantityError(updateData.stockQuantity);
        }

        // Validar longitud del nombre si se proporciona
        if (updateData.name && updateData.name.length > 255) {
            throw new ProductNameTooLongError(updateData.name.length, 255);
        }

        // Validar número de imágenes si se proporciona
        if (updateData.images && updateData.images.length > 10) {
            throw new TooManyImagesError(updateData.images.length, 10);
        }

        // Validar URLs de imágenes si se proporcionan
        if (updateData.images) {
            updateData.images.forEach(image => {
                if (!this.isValidImageUrl(image)) {
                    throw new Error(`Invalid image URL: ${image}`);
                }
            });
        }
    }

    private isValidImageUrl(url: string): boolean {
        try {
            new URL(url);
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        } catch {
            return false;
        }
    }
}