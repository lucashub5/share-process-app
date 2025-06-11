export type Process = {
    id: number
    title: string
    shortDescription: string
    subProcesses: SubProcess[]
}

export type SubProcess = {
    id: number
    title: string
    shortDescription: string
}

export const processesData: Process[] = [
    {
      id: 1,
      title: 'Mails y Teléfonos Importantes',
      shortDescription: 'Contactos clave para atención y soporte.',
      subProcesses: []
    },
    {
      id: 2,
      title: 'Pagos',
      shortDescription: 'Información sobre cobros y medios de pago.',
      subProcesses: [
        { id: 21, title: 'Moneda de Cobro', shortDescription: 'Monedas aceptadas para el pago.' },
        { id: 22, title: 'Medios de Pago', shortDescription: 'Métodos disponibles para pagar.' },
        { id: 23, title: 'Links de Pago', shortDescription: 'Enlaces directos para realizar pagos.' },
        { id: 24, title: 'Pasarelas de Pago', shortDescription: 'Plataformas utilizadas para procesar pagos.' }
      ]
    },
    {
      id: 3,
      title: 'Textos Legales',
      shortDescription: 'Documentación y condiciones legales.',
      subProcesses: [
        { id: 31, title: 'Legales', shortDescription: 'Términos, condiciones y políticas legales.' }
      ]
    },
    {
      id: 4,
      title: 'Facturación',
      shortDescription: 'Datos y opciones de facturación.',
      subProcesses: [
        { id: 41, title: 'Tipo de Factura', shortDescription: 'Facturas disponibles para emitir.' },
        { id: 42, title: 'Documento', shortDescription: 'Documentación requerida para facturar.' },
        { id: 43, title: 'Refacturaciones', shortDescription: 'Proceso para refacturar pedidos.' }
      ]
    },
    {
      id: 5,
      title: 'Entregas',
      shortDescription: 'Información sobre liberación y envíos.',
      subProcesses: [
        { id: 51, title: 'Liberación de Pedidos', shortDescription: 'Condiciones para liberar un pedido.' },
        { id: 52, title: 'Entregas', shortDescription: 'Detalles sobre cómo y cuándo se entregan productos.' }
      ]
    },
    {
      id: 6,
      title: 'Cambios y Devoluciones',
      shortDescription: 'Política de cambios y devoluciones.',
      subProcesses: []
    },
]
  