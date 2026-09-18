import pool from "../database/conexao.js";

const memoria = [];

function isDatabaseAvailable(error) {
    if (!error) return false;

    return [
        "ECONNREFUSED",
        "ER_BAD_DB_ERROR",
        "ER_NO_SUCH_TABLE",
        "ER_ACCESS_DENIED_ERROR",
        "ECONNRESET",
        "ETIMEDOUT"
    ].includes(error.code);
}

export async function criarReserva(reserva) {
    const { nome, data, hora, quadra } = reserva;
    const query = "INSERT INTO reservas (nome, data, hora, quadra) VALUES (?, ?, ?, ?)";
    const values = [nome, data, hora, quadra];

    try {
        const [result] = await pool.query(query, values);
        return result.insertId;
    } catch (error) {
        if (!isDatabaseAvailable(error)) {
            throw error;
        }

        const novaReserva = {
            id: Date.now(),
            nome,
            data,
            hora,
            quadra,
            created_at: new Date().toISOString()
        };

        memoria.push(novaReserva);
        return novaReserva.id;
    }
}

export async function listarReservas() {
    const query = "SELECT * FROM reservas ORDER BY data, hora";

    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        if (!isDatabaseAvailable(error)) {
            throw error;
        }

        return [...memoria].sort((a, b) => {
            if (a.data === b.data) return a.hora.localeCompare(b.hora);
            return a.data.localeCompare(b.data);
        });
    }
}

export async function buscarReservaPorId(id) {
    const query = "SELECT * FROM reservas WHERE id = ?";

    try {
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        if (!isDatabaseAvailable(error)) {
            throw error;
        }

        return memoria.find((reserva) => reserva.id === Number(id)) || null;
    }
}

export async function atualizarReserva(id, reservaAtualizada) {
    const { nome, data, hora, quadra } = reservaAtualizada;
    const query = "UPDATE reservas SET nome = ?, data = ?, hora = ?, quadra = ? WHERE id = ?";
    const values = [nome, data, hora, quadra, id];

    try {
        const [result] = await pool.query(query, values);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        if (!isDatabaseAvailable(error)) {
            throw error;
        }

        const index = memoria.findIndex((reserva) => reserva.id === Number(id));

        if (index === -1) {
            return false;
        }

        memoria[index] = { ...memoria[index], nome, data, hora, quadra };
        return true;
    }
}

export async function excluirReserva(id) {
    const query = "DELETE FROM reservas WHERE id = ?";

    try {
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        if (!isDatabaseAvailable(error)) {
            throw error;
        }

        const index = memoria.findIndex((reserva) => reserva.id === Number(id));

        if (index === -1) {
            return false;
        }

        memoria.splice(index, 1);
        return true;
    }
}
