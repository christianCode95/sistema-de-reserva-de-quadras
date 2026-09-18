export default function ReservaList({ reservas = [], loading, onRefresh }) {
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja cancelar esta reserva?")) {
      return;
    }

    try {
      const response = await fetch(`/reservas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erro ao cancelar reserva.");
      }

      if (onRefresh) onRefresh();
    } catch (error) {
      alert(error.message || "Não foi possível cancelar a reserva.");
    }
  };

  if (loading) {
    return (
      <section className="card list-card">
        <div className="section-title-row">
          <h2>Agenda</h2>
        </div>
        <p className="empty-state">Carregando reservas...</p>
      </section>
    );
  }

  return (
    <section className="card list-card">
      <div className="section-title-row">
        <h2>Agenda</h2>
        <button type="button" className="secondary-button" onClick={onRefresh}>
          Atualizar
        </button>
      </div>

      {reservas.length === 0 ? (
        <p className="empty-state">Nenhuma reserva cadastrada ainda.</p>
      ) : (
        <div className="reserva-list">
          {reservas.map((reserva) => (
            <article key={reserva.id} className="reserva-card">
              <div>
                <span className="tag">{reserva.quadra}</span>
                <h3>{reserva.nome}</h3>
              </div>

              <div className="reserva-details">
                <p>
                  <strong>Data:</strong> {new Date(`${reserva.data}T00:00:00`).toLocaleDateString("pt-BR")}
                </p>
                <p>
                  <strong>Hora:</strong> {reserva.hora}
                </p>
              </div>

              <button type="button" className="danger-button" onClick={() => handleDelete(reserva.id)}>
                Cancelar
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
