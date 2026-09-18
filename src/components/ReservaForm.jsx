import { useState } from "react";

const initialState = {
  nome: "",
  data: "",
  hora: "",
  quadra: "",
};

export default function ReservaForm({ onSuccess }) {
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar reserva.");
      }

      setForm(initialState);
      setMessage({ type: "success", text: "Reserva criada com sucesso!" });
      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Não foi possível criar a reserva." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card form-card">
      <div className="section-title-row">
        <h2>Nova reserva</h2>
      </div>

      <form className="reserva-form" onSubmit={handleSubmit}>
        <label>
          Nome
          <input type="text" name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome" required />
        </label>

        <label>
          Data
          <input type="date" name="data" value={form.data} onChange={handleChange} required />
        </label>

        <label>
          Hora
          <input type="time" name="hora" value={form.hora} onChange={handleChange} required />
        </label>

        <label>
          Quadra
          <select name="quadra" value={form.quadra} onChange={handleChange} required>
            <option value="">Selecione</option>
            <option value="Quadra 1">Quadra 1</option>
            <option value="Quadra 2">Quadra 2</option>
            <option value="Quadra 3">Quadra 3</option>
          </select>
        </label>

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Reservar agora"}
        </button>
      </form>

      {message.text && (
        <p className={`feedback ${message.type}`}>{message.text}</p>
      )}
    </section>
  );
}
