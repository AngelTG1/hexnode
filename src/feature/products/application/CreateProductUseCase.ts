// ===== src/feature/products/application/CreateProductUseCase.ts =====
import { ProductRepository } from '../domain/ProductRepository';
import { Product, CreateProductData } from '../domain/Product';
import { 
    ProductRequiredFieldError, 
    InvalidPriceError, 
    InvalidStockQuantityError,
    ProductNameTooLongError,
    TooManyImagesError
} from '../domain/ProductErrors';

export class CreateProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(productData: CreateProductData): Promise<Product> {
        console.log('📦 CreateProductUseCase - Creating product:', productData.name);

        // Validaciones
        this.validateRequiredFields(productData);
        this.validateProductData(productData);

        // Verificar si el vendedor puede crear más productos
        const canCreate = await this.productRepository.canSellerCreateProduct(productData.sellerId);
        if (!canCreate) {
            throw new Error('SELLER_PRODUCT_LIMIT_REACHED');
        }

        // Crear producto
        const product = await this.productRepository.create({
            ...productData,
            images: productData.images || []
        });

        console.log('✅ Product created successfully:', product.uuid);
        return product;
    }

    private validateRequiredFields(productData: CreateProductData): void {
        if (!productData.name?.trim()) {
            throw new ProductRequiredFieldError('name');
        }
        if (!productData.description?.trim()) {
            throw new ProductRequiredFieldError('description');
        }
        if (!productData.category?.trim()) {
            throw new ProductRequiredFieldError('category');
        }
        if (productData.price === undefined || productData.price === null) {
            throw new ProductRequiredFieldError('price');
        }
        if (productData.stockQuantity === undefined || productData.stockQuantity === null) {
            throw new ProductRequiredFieldError('stockQuantity');
        }
        if (!productData.sellerId) {
            throw new ProductRequiredFieldError('sellerId');
        }
    }

    private validateProductData(productData: CreateProductData): void {
        // Validar precio
        if (productData.price <= 0) {
            throw new InvalidPriceError(productData.price);
        }

        // Validar stock
        if (productData.stockQuantity < 0) {
            throw new InvalidStockQuantityError(productData.stockQuantity);
        }

        // Validar longitud del nombre
        if (productData.name.length > 255) {
            throw new ProductNameTooLongError(productData.name.length, 255);
        }

        // Validar número de imágenes
        if (productData.images && productData.images.length > 10) {
            throw new TooManyImagesError(productData.images.length, 10);
        }

        // Validar URLs de imágenes
        if (productData.images) {
            productData.images.forEach(image => {
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