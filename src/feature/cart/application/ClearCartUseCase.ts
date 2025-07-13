// ===== src/feature/cart/application/ClearCartUseCase.ts =====
import { CartRepository } from '../domain/CartRepository';
import { Cart } from '../domain/Cart';
import { CartNotFoundError } from '../domain/CartErrors';

export class ClearCartUseCase {
    constructor(private readonly cartRepository: CartRepository) {}

    async execute(userId: number): Promise<Cart> {
        console.log('🗑️ ClearCartUseCase - Clearing cart for user:', userId);

        const cart = await this.cartRepository.getActiveCart(userId);
        
        const cleared = await this.cartRepository.clearCart(cart.id);
        if (!cleared) {
            throw new CartNotFoundError(cart.uuid);
        }

        // Obtener carrito vacío
        const clearedCart = await this.cartRepository.getActiveCart(userId);
        console.log('✅ Cart cleared successfully');
        return clearedCart;
    }
}