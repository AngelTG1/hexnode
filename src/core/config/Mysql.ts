// ===== src/config/Database.ts =====
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'my_db',  // Cambiado para usar DB_DATABASE
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

export const pool = mysql.createPool(config);

export const connectDatabase = async (): Promise<boolean> => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        console.log(`📊 Connected to: ${config.database} on ${config.host}:${config.port}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};

export const executeQuery = async (sql: string, params: any[] = []): Promise<any> => {
    try {
        const [result] = await pool.execute(sql, params);
        return result;
    } catch (error) {
        console.error('💥 Query execution failed:', error);
        throw error;
    }
};