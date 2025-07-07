// ===== src/users/infrastructure/repositories/MysqlUserRepository.ts =====
import { executeQuery } from '../../../../core/config/Mysql';
import { User, CreateUserData } from '../../domain/User';
import { UserRepository } from '../../domain/UserRepository';
import { v4 as uuidv4 } from 'uuid';

export class MysqlUserRepository implements UserRepository {
    
    async findAll(): Promise<User[]> {
        console.log('📋 MysqlUserRepository - Finding all users');
        
        const sql = `
            SELECT id, uuid, name, lastName, email, password, phone, role, created_at, updated_at 
            FROM users 
            ORDER BY created_at DESC
        `;
        
        try {
            const rows = await executeQuery(sql);
            const users = rows.map((row: any) => this.mapRowToUser(row));
            console.log(`✅ Found ${users.length} users`);
            return users;
        } catch (error) {
            console.error('💥 Error finding all users:', error);
            throw new Error('Failed to fetch users');
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        console.log('🔍 MysqlUserRepository - Finding user by email:', email);
        
        const sql = `
            SELECT id, uuid, name, lastName, email, password, phone, role, created_at, updated_at 
            FROM users 
            WHERE email = ?
        `;
        
        try {
            const rows = await executeQuery(sql, [email]);
            if (rows.length > 0) {
                const user = this.mapRowToUser(rows[0]);
                console.log('✅ User found by email');
                return user;
            }
            console.log('❌ User not found by email');
            return null;
        } catch (error) {
            console.error('💥 Error finding user by email:', error);
            throw new Error('Failed to find user by email');
        }
    }

    async emailExists(email: string): Promise<boolean> {
        console.log('🔍 MysqlUserRepository - Checking if email exists:', email);
        
        const sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
        
        try {
            const rows = await executeQuery(sql, [email]);
            const exists = rows[0].count > 0;
            console.log('📊 Email exists:', exists);
            return exists;
        } catch (error) {
            console.error('💥 Error checking email existence:', error);
            throw new Error('Failed to check email existence');
        }
    }

    async create(userData: CreateUserData): Promise<User> {
        console.log('💾 MysqlUserRepository - Creating user:', userData.email);
        
        const uuid = uuidv4();
        const { name, lastName, email, password, phone, role = 'Cliente' } = userData;
        
        const sql = `
            INSERT INTO users (uuid, name, lastName, email, password, phone, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            uuid,
            name.trim(),
            lastName.trim(),
            email.trim(),
            password,
            phone?.trim() || null,
            role
        ];
        
        try {
            const result = await executeQuery(sql, params);
            console.log('✅ User inserted with ID:', result.insertId);
            
            // Obtener el usuario creado
            const createdUser = await this.findByUuid(uuid);
            if (!createdUser) {
                throw new Error('Failed to retrieve created user');
            }
            
            console.log('🎉 User created successfully');
            return createdUser;
        } catch (error: any) {
            console.error('💥 Error creating user:', error.message);
            
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email already exists');
            }
            
            throw new Error('Failed to create user');
        }
    }

    async findByUuid(uuid: string): Promise<User | null> {
        console.log('🔍 MysqlUserRepository - Finding user by UUID:', uuid);
        
        const sql = `
            SELECT id, uuid, name, lastName, email, password, phone, role, created_at, updated_at 
            FROM users 
            WHERE uuid = ?
        `;
        
        try {
            const rows = await executeQuery(sql, [uuid]);
            if (rows.length > 0) {
                const user = this.mapRowToUser(rows[0]);
                console.log('✅ User found by UUID');
                return user;
            }
            console.log('❌ User not found by UUID');
            return null;
        } catch (error) {
            console.error('💥 Error finding user by UUID:', error);
            throw new Error('Failed to find user by UUID');
        }
    }

    async findById(id: number): Promise<User | null> {
        console.log('🔍 MysqlUserRepository - Finding user by ID:', id);
        
        const sql = `
            SELECT id, uuid, name, lastName, email, password, phone, role, created_at, updated_at 
            FROM users 
            WHERE id = ?
        `;
        
        try {
            const rows = await executeQuery(sql, [id]);
            if (rows.length > 0) {
                const user = this.mapRowToUser(rows[0]);
                console.log('✅ User found by ID');
                return user;
            }
            console.log('❌ User not found by ID');
            return null;
        } catch (error) {
            console.error('💥 Error finding user by ID:', error);
            throw new Error('Failed to find user by ID');
        }
    }

    async update(uuid: string, userData: Partial<CreateUserData>): Promise<User | null> {
        console.log('🔄 MysqlUserRepository - Updating user:', uuid);
        
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        
        if (userData.name) {
            updateFields.push('name = ?');
            updateValues.push(userData.name.trim());
        }
        if (userData.lastName) {
            updateFields.push('lastName = ?');
            updateValues.push(userData.lastName.trim());
        }
        if (userData.email) {
            updateFields.push('email = ?');
            updateValues.push(userData.email.trim());
        }
        if (userData.password) {
            updateFields.push('password = ?');
            updateValues.push(userData.password);
        }
        if (userData.phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(userData.phone?.trim() || null);
        }
        if (userData.role) {
            updateFields.push('role = ?');
            updateValues.push(userData.role);
        }
        
        if (updateFields.length === 0) {
            console.log('❌ No fields to update');
            return null;
        }
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(uuid);
        
        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE uuid = ?`;
        
        try {
            const result = await executeQuery(sql, updateValues);
            
            if (result.affectedRows > 0) {
                console.log('✅ User updated successfully');
                return await this.findByUuid(uuid);
            }
            
            console.log('❌ User not found for update');
            return null;
        } catch (error) {
            console.error('💥 Error updating user:', error);
            throw new Error('Failed to update user');
        }
    }

    async delete(uuid: string): Promise<boolean> {
        console.log('🗑️ MysqlUserRepository - Deleting user:', uuid);
        
        const sql = 'DELETE FROM users WHERE uuid = ?';
        
        try {
            const result = await executeQuery(sql, [uuid]);
            const deleted = result.affectedRows > 0;
            
            console.log(`${deleted ? '✅' : '❌'} Delete result:`, result.affectedRows, 'rows affected');
            return deleted;
        } catch (error) {
            console.error('💥 Error deleting user:', error);
            throw new Error('Failed to delete user');
        }
    }

    private mapRowToUser(row: any): User {
        return new User(
            row.id,
            row.uuid,
            row.name,
            row.lastName,
            row.email,
            row.password,
            row.phone,
            row.role,
            row.created_at,
            row.updated_at
        );
    }
}