// ===== src/feature/cart/application/GetCartUseCase.ts =====
import { CartRepository } from '../domain/CartRepository';
import { Cart } from '../domain/Cart';

export class GetCartUseCase {
    constructor(private readonly cartRepository: CartRepository) {}

    async execute(userId: number): Promise<Cart> {
        console.log('📋 GetCartUseCase - Getting cart for user:', userId);

        const cart = await this.cartRepository.getActiveCart(userId);
        
        console.log(`✅ Cart retrieved with ${cart.totalItems} items`);
        return cart;
    }
}