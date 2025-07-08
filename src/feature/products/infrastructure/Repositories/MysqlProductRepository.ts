// ===== src/feature/products/infrastructure/repositories/MysqlProductRepository.ts - COMPATIBLE =====
import { executeQuery } from '../../../../core/config/Mysql';
import { Product, CreateProductData, UpdateProductData, ProductFilters, ProductStatus } from '../../domain/Product';
import { ProductRepository } from '../../domain/ProductRepository';
import { v4 as uuidv4 } from 'uuid';

export class MysqlProductRepository implements ProductRepository {

    async create(productData: CreateProductData): Promise<Product> {
        console.log('💾 MysqlProductRepository - Creating product:', productData.name);

        const uuid = uuidv4();
        const { sellerId, name, description, price, stockQuantity, category, images = [] } = productData;

        // ✅ CAMBIO: Crear productos como 'active' por defecto
        // En el futuro puedes agregar lógica para que solo admins creen productos activos
        const sql = `
        INSERT INTO products (uuid, seller_id, name, description, price, stock_quantity, category, images, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `;

        const params = [
            uuid,
            sellerId,
            name.trim(),
            description.trim(),
            price,
            stockQuantity,
            category.trim(),
            JSON.stringify(images)
        ];

        try {
            const result = await executeQuery(sql, params);
            console.log('✅ Product inserted with ID:', result.insertId);

            const createdProduct = await this.findByUuid(uuid);
            if (!createdProduct) {
                throw new Error('Failed to retrieve created product');
            }

            console.log('🎉 Product created successfully with status: active');
            return createdProduct;
        } catch (error: any) {
            console.error('💥 Error creating product:', error.message);
            throw new Error('Failed to create product');
        }
    }

    async findByUuid(uuid: string): Promise<Product | null> {
        console.log('🔍 MysqlProductRepository - Finding product by UUID:', uuid);

        const sql = `
            SELECT id, uuid, seller_id, name, description, price, stock_quantity, 
                   category, images, status, views_count, created_at, updated_at
            FROM products 
            WHERE uuid = ?
        `;

        try {
            const rows = await executeQuery(sql, [uuid]);
            if (rows.length > 0) {
                const product = this.mapRowToProduct(rows[0]);
                console.log('✅ Product found by UUID');
                return product;
            }
            console.log('❌ Product not found by UUID');
            return null;
        } catch (error) {
            console.error('💥 Error finding product by UUID:', error);
            throw new Error('Failed to find product by UUID');
        }
    }

    async findById(id: number): Promise<Product | null> {
        console.log('🔍 MysqlProductRepository - Finding product by ID:', id);

        const sql = `
            SELECT id, uuid, seller_id, name, description, price, stock_quantity, 
                   category, images, status, views_count, created_at, updated_at
            FROM products 
            WHERE id = ?
        `;

        try {
            const rows = await executeQuery(sql, [id]);
            if (rows.length > 0) {
                const product = this.mapRowToProduct(rows[0]);
                console.log('✅ Product found by ID');
                return product;
            }
            console.log('❌ Product not found by ID');
            return null;
        } catch (error) {
            console.error('💥 Error finding product by ID:', error);
            throw new Error('Failed to find product by ID');
        }
    }

    async findAll(filters: ProductFilters = {}): Promise<Product[]> {
        console.log('📋 MysqlProductRepository - Finding all products with filters:', filters);

        try {
            // Construir la consulta base
            let sql = `
                SELECT id, uuid, seller_id, name, description, price, stock_quantity, 
                       category, images, status, views_count, created_at, updated_at
                FROM products
            `;

            const conditions: string[] = [];
            const params: any[] = [];

            // Aplicar filtros
            if (filters.status) {
                conditions.push('status = ?');
                params.push(filters.status);
            } else {
                // Por defecto, solo productos activos
                conditions.push('status = ?');
                params.push('active');
            }

            if (filters.category) {
                conditions.push('category = ?');
                params.push(filters.category);
            }

            if (filters.sellerId) {
                conditions.push('seller_id = ?');
                params.push(filters.sellerId);
            }

            if (filters.minPrice !== undefined && filters.minPrice !== null) {
                conditions.push('price >= ?');
                params.push(filters.minPrice);
            }

            if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
                conditions.push('price <= ?');
                params.push(filters.maxPrice);
            }

            if (filters.search) {
                conditions.push('(name LIKE ? OR description LIKE ?)');
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            // Agregar WHERE si hay condiciones
            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }

            // Ordenar
            sql += ' ORDER BY created_at DESC';

            // PAGINACIÓN - Usar sintaxis compatible
            const page = filters.page || 1;
            const limit = filters.limit || 20;

            // Calcular offset
            const offset = (page - 1) * limit;

            // Usar sintaxis LIMIT offset, count (más compatible)
            sql += ` LIMIT ${offset}, ${limit}`;

            console.log('📝 SQL Query:', sql);
            console.log('📝 Parameters:', params);

            const rows = await executeQuery(sql, params);
            const products = rows.map((row: any) => this.mapRowToProduct(row));
            console.log(`✅ Found ${products.length} products`);
            return products;
        } catch (error) {
            console.error('💥 Error finding all products:', error);
            throw new Error('Failed to fetch products');
        }
    }

    async findBySellerId(sellerId: number, filters: Omit<ProductFilters, 'sellerId'> = {}): Promise<Product[]> {
        console.log('👤 MysqlProductRepository - Finding products by seller:', sellerId);

        const filtersWithSeller = { ...filters, sellerId };
        return await this.findAll(filtersWithSeller);
    }

    async update(uuid: string, productData: UpdateProductData): Promise<Product | null> {
        console.log('🔄 MysqlProductRepository - Updating product:', uuid);

        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (productData.name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(productData.name.trim());
        }
        if (productData.description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(productData.description.trim());
        }
        if (productData.price !== undefined) {
            updateFields.push('price = ?');
            updateValues.push(productData.price);
        }
        if (productData.stockQuantity !== undefined) {
            updateFields.push('stock_quantity = ?');
            updateValues.push(productData.stockQuantity);
        }
        if (productData.category !== undefined) {
            updateFields.push('category = ?');
            updateValues.push(productData.category.trim());
        }
        if (productData.images !== undefined) {
            updateFields.push('images = ?');
            updateValues.push(JSON.stringify(productData.images));
        }
        if (productData.status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(productData.status);
        }

        if (updateFields.length === 0) {
            console.log('❌ No fields to update');
            return null;
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(uuid);

        const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE uuid = ?`;

        try {
            const result = await executeQuery(sql, updateValues);

            if (result.affectedRows > 0) {
                console.log('✅ Product updated successfully');
                return await this.findByUuid(uuid);
            }

            console.log('❌ Product not found for update');
            return null;
        } catch (error) {
            console.error('💥 Error updating product:', error);
            throw new Error('Failed to update product');
        }
    }

    async delete(uuid: string): Promise<boolean> {
        console.log('🗑️ MysqlProductRepository - Deleting product:', uuid);

        const sql = 'DELETE FROM products WHERE uuid = ?';

        try {
            const result = await executeQuery(sql, [uuid]);
            const deleted = result.affectedRows > 0;

            console.log(`${deleted ? '✅' : '❌'} Delete result:`, result.affectedRows, 'rows affected');
            return deleted;
        } catch (error) {
            console.error('💥 Error deleting product:', error);
            throw new Error('Failed to delete product');
        }
    }

    async incrementViews(uuid: string): Promise<boolean> {
        console.log('👁️ MysqlProductRepository - Incrementing views for:', uuid);

        const sql = 'UPDATE products SET views_count = views_count + 1 WHERE uuid = ?';

        try {
            const result = await executeQuery(sql, [uuid]);
            const updated = result.affectedRows > 0;
            console.log(`${updated ? '✅' : '❌'} Views incremented`);
            return updated;
        } catch (error) {
            console.error('💥 Error incrementing views:', error);
            return false;
        }
    }

    async belongsToSeller(uuid: string, sellerId: number): Promise<boolean> {
        console.log('🔍 MysqlProductRepository - Checking ownership:', uuid, sellerId);

        const sql = 'SELECT seller_id FROM products WHERE uuid = ?';

        try {
            const rows = await executeQuery(sql, [uuid]);
            if (rows.length > 0) {
                const belongs = rows[0].seller_id === sellerId;
                console.log(`${belongs ? '✅' : '❌'} Product belongs to seller:`, belongs);
                return belongs;
            }
            return false;
        } catch (error) {
            console.error('💥 Error checking product ownership:', error);
            return false;
        }
    }

    async search(query: string, filters: ProductFilters = {}): Promise<Product[]> {
        console.log('🔍 MysqlProductRepository - Searching products:', query);

        const searchFilters = { ...filters, search: query };
        return await this.findAll(searchFilters);
    }

    async findByCategory(category: string, filters: Omit<ProductFilters, 'category'> = {}): Promise<Product[]> {
        console.log('📂 MysqlProductRepository - Finding products by category:', category);

        const categoryFilters = { ...filters, category };
        return await this.findAll(categoryFilters);
    }

    async count(filters: ProductFilters = {}): Promise<number> {
        console.log('🔢 MysqlProductRepository - Counting products with filters');

        try {
            let sql = 'SELECT COUNT(*) as count FROM products';
            const conditions: string[] = [];
            const params: any[] = [];

            // Aplicar los mismos filtros que en findAll
            if (filters.status) {
                conditions.push('status = ?');
                params.push(filters.status);
            } else {
                conditions.push('status = ?');
                params.push('active');
            }

            if (filters.category) {
                conditions.push('category = ?');
                params.push(filters.category);
            }

            if (filters.sellerId) {
                conditions.push('seller_id = ?');
                params.push(filters.sellerId);
            }

            if (filters.minPrice !== undefined && filters.minPrice !== null) {
                conditions.push('price >= ?');
                params.push(filters.minPrice);
            }

            if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
                conditions.push('price <= ?');
                params.push(filters.maxPrice);
            }

            if (filters.search) {
                conditions.push('(name LIKE ? OR description LIKE ?)');
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }

            const rows = await executeQuery(sql, params);
            const count = rows[0].count;
            console.log('📊 Products count:', count);
            return count;
        } catch (error) {
            console.error('💥 Error counting products:', error);
            throw new Error('Failed to count products');
        }
    }

    async getCategories(): Promise<string[]> {
        console.log('📂 MysqlProductRepository - Getting all categories');

        const sql = `
            SELECT DISTINCT category 
            FROM products 
            WHERE status = 'active' AND category IS NOT NULL AND category != ''
            ORDER BY category
        `;

        try {
            const rows = await executeQuery(sql, []);
            const categories = rows.map((row: any) => row.category);
            console.log('✅ Found categories:', categories.length);
            return categories;
        } catch (error) {
            console.error('💥 Error getting categories:', error);
            throw new Error('Failed to get categories');
        }
    }

    async canSellerCreateProduct(sellerId: number): Promise<boolean> {
        console.log('🔍 MysqlProductRepository - Checking if seller can create product:', sellerId);
        return true;
    }

    async getSellerStats(sellerId: number): Promise<{ totalProducts: number; activeProducts: number; totalViews: number; totalSales?: number; }> {
        console.log('📊 MysqlProductRepository - Getting seller stats:', sellerId);

        const sql = `
            SELECT 
                COUNT(*) as totalProducts,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeProducts,
                COALESCE(SUM(views_count), 0) as totalViews
            FROM products 
            WHERE seller_id = ?
        `;

        try {
            const rows = await executeQuery(sql, [sellerId]);
            const stats = {
                totalProducts: rows[0].totalProducts || 0,
                activeProducts: rows[0].activeProducts || 0,
                totalViews: rows[0].totalViews || 0,
                totalSales: 0
            };

            console.log('✅ Seller stats retrieved:', stats);
            return stats;
        } catch (error) {
            console.error('💥 Error getting seller stats:', error);
            throw new Error('Failed to get seller stats');
        }
    }

    private mapRowToProduct(row: any): Product {
        return new Product(
            row.id,
            row.uuid,
            row.seller_id,
            row.name,
            row.description,
            parseFloat(row.price),
            row.stock_quantity,
            row.category,
            row.images ? JSON.parse(row.images) : [],
            row.status as ProductStatus,
            row.views_count || 0,
            row.created_at,
            row.updated_at
        );
    }
}