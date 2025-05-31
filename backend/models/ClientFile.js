const { getPool } = require('../config/database');

class ClientFile {
    constructor(data) {
        this.id = data.id;
        this.client_id = data.client_id;
        this.file_name = data.file_name;
        this.file_path = data.file_path;
        this.file_type = data.file_type;
        this.file_size = data.file_size;
        this.file_category = data.file_category;
        this.description = data.description;
        this.uploaded_by = data.uploaded_by;
        this.created_at = data.created_at;
    }

    static async create(fileData) {
        const pool = getPool();

        try {
            const [result] = await pool.execute(`
        INSERT INTO client_files (
          client_id, file_name, file_path, file_type, file_size, 
          file_category, description, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                fileData.client_id,
                fileData.file_name,
                fileData.file_path,
                fileData.file_type,
                fileData.file_size,
                fileData.file_category,
                fileData.description || null,
                fileData.uploaded_by
            ]);

            return await ClientFile.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        const pool = getPool();

        try {
            const [rows] = await pool.execute(`
        SELECT cf.*, u.first_name as uploader_first_name, u.last_name as uploader_last_name
        FROM client_files cf
        LEFT JOIN users u ON cf.uploaded_by = u.id
        WHERE cf.id = ?
      `, [id]);

            if (rows.length === 0) {
                return null;
            }

            return new ClientFile(rows[0]);
        } catch (error) {
            throw error;
        }
    }

    static async findByClientId(client_id) {
        const pool = getPool();

        try {
            const [rows] = await pool.execute(`
        SELECT cf.*, u.first_name as uploader_first_name, u.last_name as uploader_last_name
        FROM client_files cf
        LEFT JOIN users u ON cf.uploaded_by = u.id
        WHERE cf.client_id = ?
        ORDER BY cf.created_at DESC
      `, [client_id]);

            return rows.map(row => new ClientFile(row));
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        const pool = getPool();

        try {
            const [result] = await pool.execute(`
        DELETE FROM client_files WHERE id = ?`, [id]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ClientFile;
