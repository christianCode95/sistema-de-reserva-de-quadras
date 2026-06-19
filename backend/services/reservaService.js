import pool from '../database/conexao.js';
import Reserva from '../models/reserva.js';

const TABLE_NAME = 'reservas';

class ReservaService {
    _mapToReserva(row) {
        if (!row) return null;
        const reserva = new Reserva(row.vagas, row.preco, row.horario);
        reserva.id = row.id;
        return reserva;
    }

    _validateReservaData({ vagas, preco, horario }) {
        if (vagas === undefined || vagas === null || Number.isNaN(Number(vagas)) || Number(vagas) <= 0) {
            throw new Error('Campo "vagas" deve ser um número inteiro maior que zero.');
        }

        if (preco === undefined || preco === null || Number.isNaN(Number(preco)) || Number(preco) < 0) {
            throw new Error('Campo "preco" deve ser um número válido maior ou igual a zero.');
        }

        const dataHorario = new Date(horario);
        if (horario === undefined || horario === null || dataHorario.toString() === 'Invalid Date') {
            throw new Error('Campo "horario" deve ser uma data válida.');
        }

        return {
            vagas: Number(vagas),
            preco: Number(preco),
            horario: dataHorario,
        };
    }

    async listarReservas() {
        const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} ORDER BY horario ASC`);
        return rows.map((row) => this._mapToReserva(row));
    }

    async buscarReservaPorId(id) {
        const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
        return this._mapToReserva(rows[0]);
    }

    async criarReserva(dados) {
        const { vagas, preco, horario } = this._validateReservaData(dados);

        const [result] = await pool.query(
            `INSERT INTO ${TABLE_NAME} (vagas, preco, horario) VALUES (?, ?, ?)`,
            [vagas, preco, horario]
        );

        const reservaCriada = new Reserva(vagas, preco, horario);
        reservaCriada.id = result.insertId;
        return reservaCriada;
    }

    async atualizarReserva(id, dados) {
        const reservaExistente = await this.buscarReservaPorId(id);
        if (!reservaExistente) {
            throw new Error('Reserva não encontrada.');
        }

        const campos = [];
        const valores = [];

        if (dados.vagas !== undefined) {
            if (Number.isNaN(Number(dados.vagas)) || Number(dados.vagas) <= 0) {
                throw new Error('Campo "vagas" deve ser um número inteiro maior que zero.');
            }
            campos.push('vagas = ?');
            valores.push(Number(dados.vagas));
        }

        if (dados.preco !== undefined) {
            if (Number.isNaN(Number(dados.preco)) || Number(dados.preco) < 0) {
                throw new Error('Campo "preco" deve ser um número válido maior ou igual a zero.');
            }
            campos.push('preco = ?');
            valores.push(Number(dados.preco));
        }

        if (dados.horario !== undefined) {
            const dataHorario = new Date(dados.horario);
            if (dataHorario.toString() === 'Invalid Date') {
                throw new Error('Campo "horario" deve ser uma data válida.');
            }
            campos.push('horario = ?');
            valores.push(dataHorario);
        }

        if (campos.length === 0) {
            return reservaExistente;
        }

        valores.push(id);
        await pool.query(`UPDATE ${TABLE_NAME} SET ${campos.join(', ')} WHERE id = ?`, valores);
        return this.buscarReservaPorId(id);
    }

    async excluirReserva(id) {
        const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }

    async horarioDisponivel(horario) {
        const dataHorario = new Date(horario);
        if (dataHorario.toString() === 'Invalid Date') {
            throw new Error('Campo "horario" deve ser uma data válida.');
        }

        const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${TABLE_NAME} WHERE horario = ?`, [dataHorario]);
        return rows[0].total === 0;
    }
}

export default new ReservaService();