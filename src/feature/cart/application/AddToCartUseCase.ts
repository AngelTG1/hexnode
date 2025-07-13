// ===== src/feature/cart/application/AddToCartUseCase.ts =====
import { CartRepository } from '../domain/CartRepository';
import { ProductRepository } from '../../products/domain/ProductRepository';
import { Cart, AddToCartData } from '../domain/Cart';
import {
    ProductNotFoundError,
    InsufficientStockError,
    InvalidQuantityError,
    CartLimitExceededError
} from '../domain/CartErrors';

export class AddToCartUseCase {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository
    ) {}

    async execute(userId: number, productId: number, quantity: number): Promise<Cart> {
        console.log('🛒 AddToCartUseCase - Adding to cart:', { userId, productId, quantity });

        // Validar cantidad
        if (quantity <= 0) {
            throw new InvalidQuantityError(quantity);
        }

        // Verificar que el producto existe
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new ProductNotFoundError(productId);
        }

        // Verificar stock disponible
        if (!product.hasEnoughStock(quantity)) {
            throw new InsufficientStockError(product.name, quantity, product.stockQuantity);
        }

        // Obtener carrito activo (crear si no existe)
        const cart = await this.cartRepository.getActiveCart(userId);

        // Verificar límite de productos diferentes en el carrito (opcional)
        const maxProductsInCart = 50; // Configurable
        if (cart.items.length >= maxProductsInCart && !cart.hasProduct(productId)) {
            throw new CartLimitExceededError(maxProductsInCart);
        }

        // Si el producto ya está en el carrito, actualizar cantidad
        if (cart.hasProduct(productId)) {
            const existingItem = cart.getItem(productId)!;
            const newQuantity = existingItem.quantity + quantity;
            
            // Verificar stock para la nueva cantidad
            if (!product.hasEnoughStock(newQuantity)) {
                throw new InsufficientStockError(product.name, newQuantity, product.stockQuantity);
            }

            await this.cartRepository.updateItem(existingItem.uuid, { quantity: newQuantity });
        } else {
            // Agregar nuevo item al carrito
            const addToCartData: AddToCartData = {
                userId,
                productId,
                quantity,
                unitPrice: product.price
            };

            await this.cartRepository.addItem(cart.id, addToCartData);
        }

        // Obtener carrito actualizado
        const updatedCart = await this.cartRepository.getActiveCart(userId);
        console.log('✅ Product added to cart successfully');
        return updatedCart;
    }
}