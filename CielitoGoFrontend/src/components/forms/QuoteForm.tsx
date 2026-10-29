"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; reference: string }
  | { status: "error"; message: string };

type QuoteFormProps = {
  destinationOptions?: string[];
};

export function QuoteForm({ destinationOptions = [] }: QuoteFormProps) {
  const [adults, setAdults] = useState(2);
  const [minors, setMinors] = useState(0);
  const [departureDate, setDepartureDate] = useState("");
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const successRef = useRef<HTMLDivElement>(null);
  const travelers = useMemo(() => adults + minors, [adults, minors]);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (submission.status === "success") successRef.current?.focus();
  }, [submission.status]);

  const fieldError = (name: string) => fieldErrors[name];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submission.status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setFieldErrors({});

    if (data.get("website")) {
      setSubmission({ status: "error", message: "No fue posible validar el formulario." });
      return;
    }

    const payload = {
      customerName: String(data.get("customerName") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      destination: String(data.get("destination") ?? "").trim(),
      travelers,
      adults,
      minors,
      departureDate: departureDate || undefined,
      returnDate: String(data.get("returnDate") ?? "") || undefined,
      budget: data.get("budget") ? Number(data.get("budget")) : undefined,
      comments: String(data.get("comments") ?? "").trim() || undefined,
    };

    setSubmission({ status: "submitting" });

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => null);

      if (!response.ok || response.status !== 201) {
        const details =
          typeof result === "object" && result !== null && "details" in result && Array.isArray(result.details)
            ? result.details
            : [];
        const nextErrors: Record<string, string> = {};
        for (const detail of details) {
          if (
            typeof detail === "object" &&
            detail !== null &&
            "field" in detail &&
            typeof detail.field === "string" &&
            "message" in detail &&
            typeof detail.message === "string"
          ) {
            nextErrors[detail.field] = detail.message;
          }
        }
        setFieldErrors(nextErrors);
        const message =
          typeof result === "object" && result !== null && "message" in result && typeof result.message === "string"
            ? result.message
            : response.ok
              ? "El servicio respondió sin confirmar la creación de la solicitud. No se mostrará como enviada."
              : "No pudimos enviar tu solicitud. Revisa los datos o inténtalo más tarde.";
        setSubmission({ status: "error", message });
        return;
      }

      const reference =
        typeof result === "object" &&
        result !== null &&
        "quote" in result &&
        typeof result.quote === "object" &&
        result.quote !== null &&
        "id" in result.quote &&
        typeof result.quote.id === "string"
          ? result.quote.id
          : "recibida";

      setSubmission({ status: "success", reference });
      form.reset();
      setAdults(2);
      setMinors(0);
      setDepartureDate("");
    } catch {
      setSubmission({
        status: "error",
        message: "No pudimos conectar con el servicio de cotizaciones. Tu solicitud no fue enviada.",
      });
    }
  }

  if (submission.status === "success") {
    return (
      <div className="quote-success" role="status" tabIndex={-1} ref={successRef}>
        <p className="eyebrow">Solicitud recibida</p>
        <h3>Gracias por compartir tu idea de viaje.</h3>
        <p>
          El backend confirmó la recepción. Conserva esta referencia: <strong>{submission.reference}</strong>.
        </p>
        <button className="text-link" type="button" onClick={() => setSubmission({ status: "idle" })}>
          Crear otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form className="quote-form" onSubmit={handleSubmit} noValidate={false}>
      <div className="quote-form__intro">
        <p className="eyebrow">Solicitud de cotización</p>
        <h3>Cuéntanos lo esencial.</h3>
        <p>Los campos marcados con * son necesarios para procesar la solicitud real.</p>
      </div>

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Sitio web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form-grid">
        <div className="field field--wide">
          <label htmlFor="customerName">Nombre completo *</label>
          <input id="customerName" name="customerName" type="text" minLength={2} maxLength={200} autoComplete="name" required aria-invalid={Boolean(fieldError("customerName"))} aria-describedby={fieldError("customerName") ? "customerName-error" : undefined} />
          {fieldError("customerName") ? <span className="field-error" id="customerName-error">{fieldError("customerName")}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="email">Correo electrónico *</label>
          <input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(fieldError("email"))} aria-describedby={fieldError("email") ? "email-error" : undefined} />
          {fieldError("email") ? <span className="field-error" id="email-error">{fieldError("email")}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="phone">Teléfono con lada *</label>
          <input id="phone" name="phone" type="tel" minLength={7} maxLength={50} autoComplete="tel" inputMode="tel" required aria-invalid={Boolean(fieldError("phone"))} aria-describedby={fieldError("phone") ? "phone-error" : undefined} />
          {fieldError("phone") ? <span className="field-error" id="phone-error">{fieldError("phone")}</span> : null}
        </div>

        <div className="field field--wide">
          <label htmlFor="destination">Destino de interés *</label>
          <input id="destination" name="destination" type="text" list="destination-options" minLength={2} maxLength={200} required aria-invalid={Boolean(fieldError("destination"))} aria-describedby={fieldError("destination") ? "destination-error" : undefined} />
          {fieldError("destination") ? <span className="field-error" id="destination-error">{fieldError("destination")}</span> : null}
          {destinationOptions.length ? (
            <datalist id="destination-options">
              {destinationOptions.map((destination) => <option value={destination} key={destination} />)}
            </datalist>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="adults">Adultos *</label>
          <input
            id="adults"
            name="adults"
            type="number"
            min={1}
            max={50}
            inputMode="numeric"
            value={adults}
            onChange={(event) => setAdults(Math.max(1, Number(event.target.value) || 1))}
            required
            aria-invalid={Boolean(fieldError("adults") || fieldError("travelers"))}
            aria-describedby={fieldError("adults") || fieldError("travelers") ? "travelers-error" : undefined}
          />
        </div>

        {fieldError("adults") || fieldError("travelers") ? <span className="field-error field--wide" id="travelers-error">{fieldError("adults") || fieldError("travelers")}</span> : null}

        <div className="field">
          <label htmlFor="minors">Menores</label>
          <input
            id="minors"
            name="minors"
            type="number"
            min={0}
            max={50}
            inputMode="numeric"
            value={minors}
            onChange={(event) => setMinors(Math.max(0, Number(event.target.value) || 0))}
          />
        </div>

        <p className="traveler-total field--wide" aria-live="polite">
          Total de viajeros: <strong>{travelers}</strong>
        </p>

        <div className="field">
          <label htmlFor="departureDate">Fecha estimada de salida</label>
          <input id="departureDate" name="departureDate" type="date" min={today} value={departureDate} onChange={(event) => setDepartureDate(event.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="returnDate">Fecha estimada de regreso</label>
          <input id="returnDate" name="returnDate" type="date" min={departureDate || today} aria-invalid={Boolean(fieldError("returnDate"))} aria-describedby={fieldError("returnDate") ? "returnDate-error" : undefined} />
          {fieldError("returnDate") ? <span className="field-error" id="returnDate-error">{fieldError("returnDate")}</span> : null}
        </div>

        <div className="field field--wide">
          <label htmlFor="budget">Presupuesto estimado (opcional)</label>
          <input id="budget" name="budget" type="number" min={0} step={1} inputMode="decimal" />
        </div>

        <div className="field field--wide">
          <label htmlFor="comments">¿Qué imaginas para este viaje?</label>
          <textarea id="comments" name="comments" rows={5} maxLength={2000} />
        </div>
      </div>

      <label className="consent-field">
        <input name="dataConsent" type="checkbox" required />
        <span>Acepto que estos datos se utilicen para responder mi solicitud de cotización. *</span>
      </label>

      {submission.status === "error" ? <p className="form-message form-message--error" role="alert">{submission.message}</p> : null}

      <button className="button button--primary button--wide" type="submit" disabled={submission.status === "submitting"}>
        {submission.status === "submitting" ? "Enviando solicitud…" : "Enviar solicitud de cotización"}
      </button>
      <p className="form-footnote">La confirmación sólo aparece cuando el backend acepta la solicitud.</p>
    </form>
  );
}
