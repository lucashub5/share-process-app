export const seedData = [
  {
    id: 1,
    title: 'Proceso Principal 1',
    content: null,
    childrens: [
      {
        id: 2,
        title: 'Subproceso 1.1',
        content: null,
        childrens: [
          {
            id: 3,
            title: 'Documento Final',
            desc: 'Documento con contenido específico',
            content: `
              <h1 class="text-2xl font-bold mb-4">Manual de Procedimientos</h1>
              <h2 class="text-xl font-semibold mt-6 mb-2">Introducción</h2>
              <p class="text-gray-700 mb-4">Este documento contiene las instrucciones detalladas para...</p>
              
              <h2 class="text-xl font-semibold mt-6 mb-2">Pasos a seguir</h2>
              <ol class="list-decimal list-inside text-gray-700 mb-4 space-y-1">
                <li>Revisar los requisitos</li>
                <li>Completar el formulario</li>
                <li>Enviar para aprobación</li>
              </ol>
              
              <h2 class="text-xl font-semibold mt-6 mb-2">Notas importantes</h2>
              <ul class="list-disc list-inside text-gray-700 space-y-1">
                <li>Todos los campos son obligatorios</li>
                <li>El proceso puede tardar hasta 5 días hábiles</li>
              </ul>
            `,
            childrens: []
          }
        ]
      },
      {
        id: 4,
        title: 'Subproceso 1.2',
        content: null,
        childrens: []
      }
    ]
  },
  {
    id: 5,
    title: 'Proceso Principal 2',
    content: `
      <p class="text-gray-700 mb-4">Este es un proceso principal con contenido directo.</p>
      <p class="text-gray-700 mb-4">Contiene información importante sobre los procedimientos generales de la empresa.</p>
    `,
    childrens: []
  }
];