"use client";

import { FormEvent, useState } from "react";

export default function ContactClient() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="container-brand py-10 md:py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
            Contact
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            We&apos;re listening
          </h1>
          <p className="mt-4 text-muted leading-relaxed max-w-md">
            Questions about sizing, logo prints, wholesale, or the launch? Drop
            a note — we reply within one business day.
          </p>
          <dl className="mt-10 space-y-5 text-sm">
            <div>
              <dt className="text-xs tracking-[0.16em] uppercase text-muted mb-1">
                Email
              </dt>
              <dd>hello@brand.in</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.16em] uppercase text-muted mb-1">
                WhatsApp
              </dt>
              <dd>+91 90000 00000</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.16em] uppercase text-muted mb-1">
                Hours
              </dt>
              <dd>Mon–Sat, 10:00–18:00 IST</dd>
            </div>
          </dl>
        </div>

        <div className="bg-surface p-6 md:p-8">
          {sent ? (
            <div className="py-12 text-center">
              <p className="font-display text-2xl font-semibold">Message sent</p>
              <p className="mt-2 text-sm text-muted">
                Thanks — we&apos;ll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" />
              <div>
                <label className="block text-sm mb-1.5" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full border border-line bg-chalk px-4 py-3 text-sm focus:outline-none focus:border-ink resize-y"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-ink text-chalk py-3.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm mb-1.5" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full border border-line bg-chalk px-4 py-3 text-sm focus:outline-none focus:border-ink"
      />
    </div>
  );
}
