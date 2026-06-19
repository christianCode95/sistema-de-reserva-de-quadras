import express from 'express';
import ReservaController from '../controllers/reservaController.js';

const router = express.Router();

router.get('/reservas', ReservaController.listarReservas);
router.get('/reservas/verificar-horario', ReservaController.verificarHorario);
router.get('/reservas/:id', ReservaController.buscarReservaPorId);
router.post('/reservas', ReservaController.criarReserva);
router.put('/reservas/:id', ReservaController.atualizarReserva);
router.delete('/reservas/:id', ReservaController.excluirReserva);

export default router;
