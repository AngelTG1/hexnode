// ===== src/feature/cart/application/UpdateCartItemUseCase.ts =====
import { CartRepository } from '../domain/CartRepository';
import { ProductRepository } from '../../products/domain/ProductRepository';
import { Cart } from '../domain/Cart';
import {
    CartItemNotFoundError,
    UnauthorizedCartActionError,
    ProductNotFoundError,
    InsufficientStockError,
    InvalidQuantityError
} from '../domain/CartErrors';

export class UpdateCartItemUseCase {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository
    ) {}

    async execute(userId: number, itemUuid: string, quantity: number): Promise<Cart> {
        console.log('🔄 UpdateCartItemUseCase - Updating item:', { itemUuid, quantity });

        // Validar cantidad
        if (quantity <= 0) {
            throw new InvalidQuantityError(quantity);
        }

        // Verificar que el item existe y pertenece al usuario
        const item = await this.cartRepository.findItemByUuid(itemUuid);
        if (!item) {
            throw new CartItemNotFoundError(itemUuid);
        }

        const belongsToUser = await this.cartRepository.itemBelongsToUser(itemUuid, userId);
        if (!belongsToUser) {
            throw new UnauthorizedCartActionError('update item');
        }

        // Verificar stock disponible
        const product = await this.productRepository.findById(item.productId);
        if (!product) {
            throw new ProductNotFoundError(item.productId);
        }

        if (!product.hasEnoughStock(quantity)) {
            throw new InsufficientStockError(product.name, quantity, product.stockQuantity);
        }

        // Actualizar item
        await this.cartRepository.updateItem(itemUuid, { quantity });

        // Obtener carrito actualizado
        const cart = await this.cartRepository.getActiveCart(userId);
        console.log('✅ Cart item updated successfully');
        return cart;
    }
}