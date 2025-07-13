// ===== src/feature/cart/application/RemoveFromCartUseCase.ts =====
import { CartRepository } from '../domain/CartRepository';
import { Cart } from '../domain/Cart';
import {
    CartItemNotFoundError,
    UnauthorizedCartActionError
} from '../domain/CartErrors';

export class RemoveFromCartUseCase {
    constructor(private readonly cartRepository: CartRepository) {}

    async execute(userId: number, itemUuid: string): Promise<Cart> {
        console.log('🗑️ RemoveFromCartUseCase - Removing item:', itemUuid);

        // Verificar que el item pertenece al usuario
        const belongsToUser = await this.cartRepository.itemBelongsToUser(itemUuid, userId);
        if (!belongsToUser) {
            throw new UnauthorizedCartActionError('remove item');
        }

        // Eliminar item
        const removed = await this.cartRepository.removeItem(itemUuid);
        if (!removed) {
            throw new CartItemNotFoundError(itemUuid);
        }

        // Obtener carrito actualizado
        const cart = await this.cartRepository.getActiveCart(userId);
        console.log('✅ Item removed from cart successfully');
        return cart;
    }
}