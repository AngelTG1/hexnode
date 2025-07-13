// ===== src/feature/cart/application/GetCartSummaryUseCase.ts =====
import { CartRepository } from '../domain/CartRepository';

export class GetCartSummaryUseCase {
    constructor(private readonly cartRepository: CartRepository) {}

    async execute(userId: number): Promise<{ count: number; totalAmount: number }> {
        console.log('📊 GetCartSummaryUseCase - Getting summary for user:', userId);

        const summary = await this.cartRepository.getCartSummary(userId);
        
        console.log(`✅ Cart summary: ${summary.totalItems} items, $${summary.totalAmount}`);
        return {
            count: summary.totalItems,
            totalAmount: summary.totalAmount
        };
    }
}