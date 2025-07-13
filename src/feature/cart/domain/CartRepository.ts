// ===== src/feature/cart/domain/CartRepository.ts =====
import { Cart, CartItem, AddToCartData, UpdateCartItemData, CartSummary } from './Cart';

export interface CartRepository {
    // ===== CART OPERATIONS =====
    
    // Obtener carrito activo del usuario (crear si no existe)
    getActiveCart(userId: number): Promise<Cart>;
    
    // Obtener carrito por UUID
    findByUuid(uuid: string): Promise<Cart | null>;
    
    // Crear nuevo carrito
    createCart(userId: number): Promise<Cart>;
    
    // Actualizar totales del carrito
    updateCartTotals(cartId: number): Promise<boolean>;
    
    // Vaciar carrito completamente
    clearCart(cartId: number): Promise<boolean>;
    
    // Cambiar estado del carrito
    updateCartStatus(cartId: number, status: string): Promise<boolean>;

    // ===== CART ITEMS OPERATIONS =====
    
    // Agregar item al carrito
    addItem(cartId: number, addToCartData: AddToCartData): Promise<CartItem>;
    
    // Actualizar cantidad de un item
    updateItem(itemUuid: string, updateData: UpdateCartItemData): Promise<CartItem | null>;
    
    // Eliminar item del carrito
    removeItem(itemUuid: string): Promise<boolean>;
    
    // Obtener item por UUID
    findItemByUuid(itemUuid: string): Promise<CartItem | null>;
    
    // Verificar si un producto ya está en el carrito
    hasProduct(cartId: number, productId: number): Promise<boolean>;
    
    // Obtener item por producto ID
    findItemByProductId(cartId: number, productId: number): Promise<CartItem | null>;

    // ===== CART SUMMARY =====
    
    // Obtener resumen del carrito (solo totales)
    getCartSummary(userId: number): Promise<CartSummary>;
    
    // Contar items en el carrito
    getItemCount(userId: number): Promise<number>;

    // ===== CART VALIDATION =====
    
    // Verificar que el carrito pertenece al usuario
    belongsToUser(cartUuid: string, userId: number): Promise<boolean>;
    
    // Verificar que el item pertenece al usuario
    itemBelongsToUser(itemUuid: string, userId: number): Promise<boolean>;
    
    // Validar stock disponible
    validateStock(productId: number, quantity: number): Promise<boolean>;

    // ===== CLEANUP =====
    
    // Marcar carritos como abandonados
    markAbandonedCarts(): Promise<number>;
    
    // Eliminar carritos antiguos
    deleteOldCarts(daysOld: number): Promise<number>;
}