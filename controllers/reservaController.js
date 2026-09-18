import * as reservaService from "../services/reservaService.js";

const ReservaController = {
    async criarReserva(req, res) {
        try {
            const { nome, data, hora, quadra } = req.body;

            if (!nome || !data || !hora || !quadra) {
                return res.status(400).json({ error: "Preencha nome, data, hora e quadra." });
            }

            const id = await reservaService.criarReserva({ nome, data, hora, quadra });
            return res.status(201).json({ id, message: "Reserva criada com sucesso!" });
        } catch (error) {
            console.error("Erro ao criar reserva:", error);
            return res.status(500).json({ error: "Erro ao criar reserva." });
        }
    },

    async listarReservas(req, res) {
        try {
            const reservas = await reservaService.listarReservas();
            return res.json(reservas);
        } catch (error) {
            console.error("Erro ao listar reservas:", error);
            return res.status(500).json({ error: "Erro ao listar reservas." });
        }
    },

    async buscarReservaPorId(req, res) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                return res.status(400).json({ error: "ID inválido." });
            }

            const reserva = await reservaService.buscarReservaPorId(id);

            if (!reserva) {
                return res.status(404).json({ error: "Reserva não encontrada." });
            }

            return res.json(reserva);
        } catch (error) {
            console.error("Erro ao buscar reserva:", error);
            return res.status(500).json({ error: "Erro ao buscar reserva." });
        }
    },

    async atualizarReserva(req, res) {
        try {
            const id = Number(req.params.id);
            const { nome, data, hora, quadra } = req.body;

            if (!Number.isInteger(id) || !nome || !data || !hora || !quadra) {
                return res.status(400).json({ error: "Dados inválidos para atualização." });
            }

            const reservaAtualizada = await reservaService.atualizarReserva(id, { nome, data, hora, quadra });

            if (!reservaAtualizada) {
                return res.status(404).json({ error: "Reserva não encontrada." });
            }

            return res.json({ message: "Reserva atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar reserva:", error);
            return res.status(500).json({ error: "Erro ao atualizar reserva." });
        }
    },

    async excluirReserva(req, res) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                return res.status(400).json({ error: "ID inválido." });
            }

            const excluiu = await reservaService.excluirReserva(id);

            if (!excluiu) {
                return res.status(404).json({ error: "Reserva não encontrada." });
            }

            return res.json({ message: "Reserva removida com sucesso!" });
        } catch (error) {
            console.error("Erro ao excluir reserva:", error);
            return res.status(500).json({ error: "Erro ao excluir reserva." });
        }
    }
};

export default ReservaController;