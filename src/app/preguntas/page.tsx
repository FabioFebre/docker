'use client'

import { useState } from 'react'

type FAQ = {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: '¿Cuál es el horario de atención?',
    answer: 'Nuestro horario de atención es de lunes a sábado, de 9:00 a.m. a 7:00 p.m.',
  },
  {
    question: '¿Hacen envíos a todo el país?',
    answer: 'Sí, realizamos envíos a todo el país a través de servicios de mensajería confiables.',
  },
  {
    question: '¿Qué formas de pago aceptan?',
    answer: 'Aceptamos tarjetas de crédito, débito, transferencias bancarias y pagos por Yape o Plin.',
  },
  {
    question: '¿Puedo cambiar o devolver un producto?',
    answer: 'Sí, puedes solicitar cambios o devoluciones dentro de los 7 días posteriores a la compra, presentando el comprobante.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-7 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Preguntas Frecuentes</h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border rounded-lg shadow-sm">
              <button
                onClick={() => toggle(index)}
                className="w-full text-left px-6 py-4 text-lg font-medium text-gray-800 focus:outline-none flex justify-between items-center"
              >
                {faq.question}
                <span>{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
