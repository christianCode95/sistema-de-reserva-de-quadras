import reservaService from '../services/reservaService.js';

const ReservaController = {
    async listarReservas(req, res) {
        try {
            const reservas = await reservaService.listarReservas();
            return res.json(reservas);
        } catch (error) {
            return res.status(500).json({ error: error.message || 'Erro ao listar reservas.' });
        }
    },

    async buscarReservaPorId(req, res) {
        const { id } = req.params;

        try {
            const reserva = await reservaService.buscarReservaPorId(id);
            if (!reserva) {
                return res.status(404).json({ error: 'Reserva não encontrada.' });
            }
            return res.json(reserva);
        } catch (error) {
            return res.status(500).json({ error: error.message || 'Erro ao buscar reserva.' });
        }
    },

    async criarReserva(req, res) {
        try {
            const reserva = await reservaService.criarReserva(req.body);
            return res.status(201).json(reserva);
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Dados de reserva inválidos.' });
        }
    },

    async atualizarReserva(req, res) {
        const { id } = req.params;

        try {
            const reservaAtualizada = await reservaService.atualizarReserva(id, req.body);
            return res.json(reservaAtualizada);
        } catch (error) {
            if (error.message && error.message.toLowerCase().includes('não encontrada')) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(400).json({ error: error.message || 'Erro ao atualizar reserva.' });
        }
    },

    async excluirReserva(req, res) {
        const { id } = req.params;

        try {
            const excluido = await reservaService.excluirReserva(id);
            if (!excluido) {
                return res.status(404).json({ error: 'Reserva não encontrada.' });
            }
            return res.json({ message: 'Reserva excluída com sucesso.' });
        } catch (error) {
            return res.status(500).json({ error: error.message || 'Erro ao excluir reserva.' });
        }
    },

    async verificarHorario(req, res) {
        const { horario } = req.query;

        try {
            const disponivel = await reservaService.horarioDisponivel(horario);
            return res.json({ horario, disponivel });
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Horário inválido.' });
        }
    }
};

export default ReservaController;
