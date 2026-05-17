import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT,
});

// Para código async/await: misma pool subyacente, interfaz Promise
export const promisePool = pool.promise();

export default pool;
