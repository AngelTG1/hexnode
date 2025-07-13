// ===== src/feature/cart/infrastructure/repositories/MysqlCartRepository.ts =====
import { executeQuery } from '../../../../core/config/Mysql';
import { Cart, CartItem, AddToCartData, UpdateCartItemData, CartSummary } from '../../domain/Cart';
import { CartRepository } from '../../domain/CartRepository';
import { v4 as uuidv4 } from 'uuid';

export class MysqlCartRepository implements CartRepository {

    async getActiveCart(userId: number): Promise<Cart> {
        console.log('🛒 MysqlCartRepository - Getting active cart for user:', userId);

        // Buscar carrito activo existente
        let cart = await this.findActiveCartByUserId(userId);
        
        // Si no existe, crear uno nuevo
        if (!cart) {
            console.log('🆕 Creating new cart for user:', userId);
            cart = await this.createCart(userId);
        }

        return cart;
    }

    async findByUuid(uuid: string): Promise<Cart | null> {
        console.log('🔍 MysqlCartRepository - Finding cart by UUID:', uuid);

        const sql = `
            SELECT sc.id, sc.uuid, sc.user_id, sc.status, sc.total_items, 
                   sc.total_amount, sc.currency, sc.expires_at, sc.created_at, sc.updated_at
            FROM shopping_carts sc
            WHERE sc.uuid = ?
        `;

        try {
            const rows = await executeQuery(sql, [uuid]);
            if (rows.length === 0) {
                console.log('❌ Cart not found by UUID');
                return null;
            }

            const cartData = rows[0];
            const items = await this.getCartItems(cartData.id);
            
            const cart = this.mapRowToCart(cartData, items);
            console.log('✅ Cart found by UUID');
            return cart;
        } catch (error) {
            console.error('💥 Error finding cart by UUID:', error);
            throw new Error('Failed to find cart by UUID');
        }
    }

    async createCart(userId: number): Promise<Cart> {
        console.log('🆕 MysqlCartRepository - Creating cart for user:', userId);

        const uuid = uuidv4();
        const sql = `
            INSERT INTO shopping_carts (uuid, user_id, status, total_items, total_amount, currency)
            VALUES (?, ?, 'active', 0, 0.00, 'USD')
        `;

        try {
            const result = await executeQuery(sql, [uuid, userId]);
            console.log('✅ Cart created with ID:', result.insertId);

            const createdCart = await this.findByUuid(uuid);
            if (!createdCart) {
                throw new Error('Failed to retrieve created cart');
            }

            return createdCart;
        } catch (error) {
            console.error('💥 Error creating cart:', error);
            throw new Error('Failed to create cart');
        }
    }

    async addItem(cartId: number, addToCartData: AddToCartData): Promise<CartItem> {
        console.log('➕ MysqlCartRepository - Adding item to cart:', cartId);

        const uuid = uuidv4();
        const totalPrice = addToCartData.quantity * addToCartData.unitPrice;

        const sql = `
            INSERT INTO cart_items (uuid, cart_id, product_id, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        try {
            const result = await executeQuery(sql, [
                uuid,
                cartId,
                addToCartData.productId,
                addToCartData.quantity,
                addToCartData.unitPrice,
                totalPrice
            ]);

            console.log('✅ Item added to cart with ID:', result.insertId);

            // Actualizar totales del carrito
            await this.updateCartTotals(cartId);

            const createdItem = await this.findItemByUuid(uuid);
            if (!createdItem) {
                throw new Error('Failed to retrieve created cart item');
            }

            return createdItem;
        } catch (error) {
            console.error('💥 Error adding item to cart:', error);
            throw new Error('Failed to add item to cart');
        }
    }

    async updateItem(itemUuid: string, updateData: UpdateCartItemData): Promise<CartItem | null> {
        console.log('🔄 MysqlCartRepository - Updating cart item:', itemUuid);

        const totalPrice = updateData.quantity * await this.getItemUnitPrice(itemUuid);

        const sql = `
            UPDATE cart_items 
            SET quantity = ?, total_price = ?, updated_at = CURRENT_TIMESTAMP
            WHERE uuid = ?
        `;

        try {
            const result = await executeQuery(sql, [updateData.quantity, totalPrice, itemUuid]);

            if (result.affectedRows === 0) {
                console.log('❌ Cart item not found for update');
                return null;
            }

            // Obtener cart_id para actualizar totales
            const item = await this.findItemByUuid(itemUuid);
            if (item) {
                await this.updateCartTotals(item.cartId);
            }

            console.log('✅ Cart item updated successfully');
            return await this.findItemByUuid(itemUuid);
        } catch (error) {
            console.error('💥 Error updating cart item:', error);
            throw new Error('Failed to update cart item');
        }
    }

    async removeItem(itemUuid: string): Promise<boolean> {
        console.log('🗑️ MysqlCartRepository - Removing cart item:', itemUuid);

        // Obtener cart_id antes de eliminar
        const item = await this.findItemByUuid(itemUuid);
        if (!item) {
            return false;
        }

        const sql = 'DELETE FROM cart_items WHERE uuid = ?';

        try {
            const result = await executeQuery(sql, [itemUuid]);
            const removed = result.affectedRows > 0;

            if (removed) {
                // Actualizar totales del carrito
                await this.updateCartTotals(item.cartId);
                console.log('✅ Cart item removed successfully');
            }

            return removed;
        } catch (error) {
            console.error('💥 Error removing cart item:', error);
            throw new Error('Failed to remove cart item');
        }
    }

    async findItemByUuid(itemUuid: string): Promise<CartItem | null> {
        const sql = `
            SELECT ci.id, ci.uuid, ci.cart_id, ci.product_id, ci.quantity, 
                   ci.unit_price, ci.total_price, ci.added_at, ci.updated_at,
                   p.name, p.description, p.price, p.images, p.stock_quantity
            FROM cart_items ci
            LEFT JOIN products p ON ci.product_id = p.id
            WHERE ci.uuid = ?
        `;

        try {
            const rows = await executeQuery(sql, [itemUuid]);
            if (rows.length === 0) {
                return null;
            }

            return this.mapRowToCartItem(rows[0]);
        } catch (error) {
            console.error('💥 Error finding cart item by UUID:', error);
            return null;
        }
    }

    async clearCart(cartId: number): Promise<boolean> {
        console.log('🗑️ MysqlCartRepository - Clearing cart:', cartId);

        const sql = 'DELETE FROM cart_items WHERE cart_id = ?';

        try {
            await executeQuery(sql, [cartId]);
            await this.updateCartTotals(cartId);
            console.log('✅ Cart cleared successfully');
            return true;
        } catch (error) {
            console.error('💥 Error clearing cart:', error);
            return false;
        }
    }

    async updateCartTotals(cartId: number): Promise<boolean> {
        console.log('📊 MysqlCartRepository - Updating cart totals:', cartId);

        const sql = `
            UPDATE shopping_carts 
            SET 
                total_items = (SELECT COALESCE(SUM(quantity), 0) FROM cart_items WHERE cart_id = ?),
                total_amount = (SELECT COALESCE(SUM(total_price), 0.00) FROM cart_items WHERE cart_id = ?),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        try {
            await executeQuery(sql, [cartId, cartId, cartId]);
            console.log('✅ Cart totals updated');
            return true;
        } catch (error) {
            console.error('💥 Error updating cart totals:', error);
            return false;
        }
    }

    async getCartSummary(userId: number): Promise<CartSummary> {
        const sql = `
            SELECT total_items, total_amount, currency
            FROM shopping_carts
            WHERE user_id = ? AND status = 'active'
        `;

        try {
            const rows = await executeQuery(sql, [userId]);
            if (rows.length === 0) {
                return { totalItems: 0, totalAmount: 0, currency: 'USD' };
            }

            return {
                totalItems: rows[0].total_items || 0,
                totalAmount: parseFloat(rows[0].total_amount) || 0,
                currency: rows[0].currency || 'USD'
            };
        } catch (error) {
            console.error('💥 Error getting cart summary:', error);
            return { totalItems: 0, totalAmount: 0, currency: 'USD' };
        }
    }

    async getItemCount(userId: number): Promise<number> {
        const summary = await this.getCartSummary(userId);
        return summary.totalItems;
    }

    async hasProduct(cartId: number, productId: number): Promise<boolean> {
        const sql = 'SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ? AND product_id = ?';
        
        try {
            const rows = await executeQuery(sql, [cartId, productId]);
            return rows[0].count > 0;
        } catch (error) {
            console.error('💥 Error checking if cart has product:', error);
            return false;
        }
    }

    async findItemByProductId(cartId: number, productId: number): Promise<CartItem | null> {
        const sql = `
            SELECT ci.id, ci.uuid, ci.cart_id, ci.product_id, ci.quantity, 
                   ci.unit_price, ci.total_price, ci.added_at, ci.updated_at,
                   p.name, p.description, p.price, p.images, p.stock_quantity
            FROM cart_items ci
            LEFT JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ? AND ci.product_id = ?
        `;

        try {
            const rows = await executeQuery(sql, [cartId, productId]);
            if (rows.length === 0) {
                return null;
            }

            return this.mapRowToCartItem(rows[0]);
        } catch (error) {
            console.error('💥 Error finding cart item by product ID:', error);
            return null;
        }
    }

    async belongsToUser(cartUuid: string, userId: number): Promise<boolean> {
        const sql = 'SELECT user_id FROM shopping_carts WHERE uuid = ?';
        
        try {
            const rows = await executeQuery(sql, [cartUuid]);
            return rows.length > 0 && rows[0].user_id === userId;
        } catch (error) {
            console.error('💥 Error checking cart ownership:', error);
            return false;
        }
    }

    async itemBelongsToUser(itemUuid: string, userId: number): Promise<boolean> {
        const sql = `
            SELECT sc.user_id 
            FROM cart_items ci
            JOIN shopping_carts sc ON ci.cart_id = sc.id
            WHERE ci.uuid = ?
        `;
        
        try {
            const rows = await executeQuery(sql, [itemUuid]);
            return rows.length > 0 && rows[0].user_id === userId;
        } catch (error) {
            console.error('💥 Error checking cart item ownership:', error);
            return false;
        }
    }

    async validateStock(productId: number, quantity: number): Promise<boolean> {
        const sql = 'SELECT stock_quantity FROM products WHERE id = ? AND status = "active"';
        
        try {
            const rows = await executeQuery(sql, [productId]);
            if (rows.length === 0) {
                return false;
            }
            
            return rows[0].stock_quantity >= quantity;
        } catch (error) {
            console.error('💥 Error validating stock:', error);
            return false;
        }
    }

    async updateCartStatus(cartId: number, status: string): Promise<boolean> {
        const sql = 'UPDATE shopping_carts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        
        try {
            const result = await executeQuery(sql, [status, cartId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('💥 Error updating cart status:', error);
            return false;
        }
    }

    async markAbandonedCarts(): Promise<number> {
        const sql = `
            UPDATE shopping_carts 
            SET status = 'abandoned' 
            WHERE status = 'active' 
            AND updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
        `;
        
        try {
            const result = await executeQuery(sql, []);
            console.log(`📊 Marked ${result.affectedRows} carts as abandoned`);
            return result.affectedRows;
        } catch (error) {
            console.error('💥 Error marking abandoned carts:', error);
            return 0;
        }
    }

    async deleteOldCarts(daysOld: number): Promise<number> {
        const sql = `
            DELETE FROM shopping_carts 
            WHERE status = 'abandoned' 
            AND updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        
        try {
            const result = await executeQuery(sql, [daysOld]);
            console.log(`🗑️ Deleted ${result.affectedRows} old carts`);
            return result.affectedRows;
        } catch (error) {
            console.error('💥 Error deleting old carts:', error);
            return 0;
        }
    }

    // ===== MÉTODOS PRIVADOS =====

    private async findActiveCartByUserId(userId: number): Promise<Cart | null> {
        const sql = `
            SELECT sc.id, sc.uuid, sc.user_id, sc.status, sc.total_items, 
                   sc.total_amount, sc.currency, sc.expires_at, sc.created_at, sc.updated_at
            FROM shopping_carts sc
            WHERE sc.user_id = ? AND sc.status = 'active'
            ORDER BY sc.updated_at DESC
            LIMIT 1
        `;

        try {
            const rows = await executeQuery(sql, [userId]);
            if (rows.length === 0) {
                return null;
            }

            const cartData = rows[0];
            const items = await this.getCartItems(cartData.id);
            
            return this.mapRowToCart(cartData, items);
        } catch (error) {
            console.error('💥 Error finding active cart:', error);
            return null;
        }
    }

    private async getCartItems(cartId: number): Promise<CartItem[]> {
        const sql = `
            SELECT ci.id, ci.uuid, ci.cart_id, ci.product_id, ci.quantity, 
                   ci.unit_price, ci.total_price, ci.added_at, ci.updated_at,
                   p.name, p.description, p.price, p.images, p.stock_quantity,
                   p.category, p.status as product_status
            FROM cart_items ci
            LEFT JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
            ORDER BY ci.added_at DESC
        `;

        try {
            const rows = await executeQuery(sql, [cartId]);
            return rows.map((row: any) => this.mapRowToCartItem(row));
        } catch (error) {
            console.error('💥 Error getting cart items:', error);
            return [];
        }
    }

    private async getItemUnitPrice(itemUuid: string): Promise<number> {
        const sql = 'SELECT unit_price FROM cart_items WHERE uuid = ?';
        
        try {
            const rows = await executeQuery(sql, [itemUuid]);
            return rows.length > 0 ? parseFloat(rows[0].unit_price) : 0;
        } catch (error) {
            console.error('💥 Error getting item unit price:', error);
            return 0;
        }
    }

    private mapRowToCart(row: any, items: CartItem[]): Cart {
        return new Cart(
            row.id,
            row.uuid,
            row.user_id,
            row.status,
            row.total_items || 0,
            parseFloat(row.total_amount) || 0,
            row.currency || 'USD',
            items,
            row.expires_at,
            row.created_at,
            row.updated_at
        );
    }

    private mapRowToCartItem(row: any): CartItem {
        // Crear objeto del producto si existe
        const product = row.name ? {
            id: row.product_id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            images: row.images ? JSON.parse(row.images) : [],
            stockQuantity: row.stock_quantity,
            category: row.category,
            status: row.product_status
        } : undefined;

        return new CartItem(
            row.id,
            row.uuid,
            row.cart_id,
            row.product_id,
            row.quantity,
            parseFloat(row.unit_price),
            parseFloat(row.total_price),
            product,
            row.added_at,
            row.updated_at
        );
    }
}