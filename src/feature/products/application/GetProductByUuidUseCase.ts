// ===== src/feature/products/application/GetProductByUuidUseCase.ts =====
import { ProductRepository } from '../domain/ProductRepository';
import { Product } from '../domain/Product';
import { ProductNotFoundError } from '../domain/ProductErrors';

export class GetProductByUuidUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(uuid: string, incrementViews: boolean = true): Promise<Product> {
        console.log('🔍 GetProductByUuidUseCase - Finding product:', uuid);

        if (!uuid?.trim()) {
            throw new ProductNotFoundError(uuid);
        }

        const product = await this.productRepository.findByUuid(uuid.trim());
        if (!product) {
            console.log('❌ Product not found:', uuid);
            throw new ProductNotFoundError(uuid);
        }

        // Incrementar vistas si se solicita
        if (incrementViews) {
            await this.productRepository.incrementViews(uuid);
            console.log('👁️ Product views incremented');
        }

        console.log('✅ Product found:', product.name);
        return product;
    }
}