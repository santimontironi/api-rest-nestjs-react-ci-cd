// Los clientes de mail no soportan CSS externo ni flexbox: tablas y estilos inline.
export function verificationEmailHtml(link: string): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000812;padding:32px 16px">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="max-width:480px;background:#fffacd;border-radius:12px;padding:32px">
        <tr>
          <td style="color:#000812;font-size:22px;font-weight:bold;padding-bottom:16px">
            Confirmá tu cuenta
          </td>
        </tr>
        <tr>
          <td style="color:#000812;font-size:15px;line-height:22px;padding-bottom:24px">
            Para terminar el registro, confirmá tu dirección de email.
            El link vence en 24 horas.
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:24px">
            <a href="${link}"
               style="display:inline-block;background:#b81104;color:#fffacd;font-size:16px;
                      font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:8px">
              Confirmar cuenta
            </a>
          </td>
        </tr>
        <tr>
          <td style="color:#000812;font-size:13px;line-height:20px;word-break:break-all">
            Si el botón no funciona, copiá este link:<br />${link}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}
