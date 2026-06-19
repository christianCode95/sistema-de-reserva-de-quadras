class Reserva{
    constructor(vagas, preco, horario){
        this.vagas = vagas;
        this.preco = Number(preco);
        this.horario = new Date(horario);
    }
}
export default Reserva