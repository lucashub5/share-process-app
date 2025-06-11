export const paymentContent = [
    {
      id: 22,
      htmlContent: ` 
  <h3>Tarjeta de Crédito</h3>
  <p>Si pagan con tarjeta del banco Banamex deben generar el código con el banco antes. Ingresan a su app, generan el código dinámico de seguridad y se continúa con la operación.</p>
  
  <h3>Tarjeta de Débito</h3>
  <p>Se aceptan pagos con tarjetas de débito.</p>
  
  <h3>MercadoPago</h3>
  <p>Disponible solo por la web. El cliente debe vincular su cuenta de MercadoPago.</p>
  
  <h3>PayPal</h3>
  <p>Disponible solo por la web. El cliente debe vincular su cuenta de PayPal.</p>
  
  <h3>Transferencia Bancaria</h3>
  <p>Demora en acreditarse entre 24 y 72 horas. El cliente debe subir el comprobante a la página una vez realizado el pago.</p>
  
  <h4>Datos Bancarios</h4>
  <ul>
    <li><strong>Depósito Bancario (Banco Banamex):</strong> Sucursal: 180 - Cuenta: 08700556043 - A nombre de: Sony de México S.A. de C.V.</li>
    <li><strong>SWIFT:</strong> CITIMXMMXX (para transferencias internacionales)</li>
    <li><strong>CLABE Interbancaria:</strong> 124180087005560432 (para pagos desde otro banco que no sea Banamex)</li>
  </ul>
  
  <h3>Depósito en Efectivo</h3>
  <p>Acreditación automática (hasta 24hs). No requiere envío de comprobante.</p>
  <ul>
    <li>Oxxo (hasta $10,000)</li>
    <li>7 Eleven (hasta $10,000)</li>
    <li>Farmacias del Ahorro (sin límite)</li>
    <li>Farmacias Benavides (sin límite)</li>
  </ul>
  <p>Al momento de pagar se entrega un recibo para imprimir. Se puede pagar en cualquiera de las tiendas mencionadas. Acreditación en 2 días hábiles.</p>
  
  <h3>Pagos mayores a $100,000</h3>
  <p><strong>Requieren documentación adicional:</strong></p>
  <h4>Persona Moral (empresa):</h4>
  <ul>
    <li>Constancia de situación fiscal</li>
    <li>INE del apoderado legal o carta poder notariada</li>
    <li>Acta constitutiva de la empresa</li>
  </ul>
  <h4>Persona Física:</h4>
  <ul>
    <li>Constancia de situación fiscal (no mayor a 3 meses)</li>
    <li>INE</li>
    <li>Comprobante de domicilio (coincidente con INE o constancia fiscal)</li>
    <li>Ejemplos: Luz, internet, etc.</li>
  </ul>
      `.trim()
    },
    {
      id: 23, // id correspondiente a "Link de Pago"
      title: "Links de Pago",
      htmlContent: `
  <h2>Links de Pago</h2>
  <p>Se debe solicitar autorización previa a Jorge Salazar o Luis Gomez de Sony Mex. Solo se utiliza para compras menores a $35,000 MXN.</p>
  <p>El monto del link debe dividirse de la siguiente forma:</p>
  <ul>
    <li>30% MercadoPago</li>
    <li>70% PayPal</li>
  </ul>
      `.trim()
    }
];
  