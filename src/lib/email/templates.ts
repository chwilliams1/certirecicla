import { buildEmailHtml } from "./email-template";

const PLATFORM_NAME = "CertiRecicla";

export function welcomeEmail({ userName, trialDays }: { userName: string; trialDays: number }): { subject: string; html: string } {
  const body = `Hola <strong>${userName}</strong>,

Bienvenido/a a CertiRecicla. Tu cuenta está lista y tienes <strong>${trialDays} días de prueba gratuita</strong> para explorar toda la plataforma.

<div style="background: #f4f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0; font-weight: 600;">Para empezar:</p>
<p style="margin: 8px 0 0;">1. Agrega tu primer cliente en la sección Clientes</p>
<p style="margin: 4px 0 0;">2. Registra retiros de reciclaje</p>
<p style="margin: 4px 0 0;">3. Genera y envía certificados con un click</p>
</div>

Si tienes dudas, responde a este correo y te ayudamos.

Saludos,
El equipo de CertiRecicla`;

  return { subject: "Bienvenido/a a CertiRecicla", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function verificationEmail({ userName, verificationUrl }: { userName: string; verificationUrl: string }): { subject: string; html: string } {
  const body = `Hola <strong>${userName}</strong>,

Para verificar tu email, haz click en el siguiente enlace:

<div style="text-align: center; margin: 24px 0;">
<a href="${verificationUrl}" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Verificar mi email</a>
</div>

Este enlace expira en 24 horas. Si no solicitaste esta verificación, puedes ignorar este correo.`;

  return { subject: "Verifica tu email — CertiRecicla", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function passwordResetEmail({ userName, resetUrl }: { userName: string; resetUrl: string }): { subject: string; html: string } {
  const body = `Hola <strong>${userName}</strong>,

Recibimos una solicitud para restablecer tu contraseña. Haz click en el siguiente enlace:

<div style="text-align: center; margin: 24px 0;">
<a href="${resetUrl}" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Restablecer contraseña</a>
</div>

Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.`;

  return { subject: "Restablecer contraseña — CertiRecicla", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function trialExpiringEmail({ companyName, daysLeft }: { companyName: string; daysLeft: number }): { subject: string; html: string } {
  const body = `Hola equipo de <strong>${companyName}</strong>,

Tu periodo de prueba en CertiRecicla termina en <strong>${daysLeft} ${daysLeft === 1 ? "día" : "días"}</strong>.

<div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0;">Para seguir usando la plataforma sin interrupciones, elige un plan antes de que expire tu prueba.</p>
</div>

<div style="text-align: center; margin: 24px 0;">
<a href="${process.env.NEXTAUTH_URL}/dashboard/billing" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Ver planes</a>
</div>

Si tienes dudas sobre qué plan elegir, responde a este correo.`;

  return { subject: `Tu prueba en CertiRecicla vence en ${daysLeft} días`, html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function trialExpiredEmail({ companyName }: { companyName: string }): { subject: string; html: string } {
  const body = `Hola equipo de <strong>${companyName}</strong>,

Tu periodo de prueba en CertiRecicla ha finalizado. Tu cuenta y datos siguen seguros, pero necesitas activar un plan para continuar.

<div style="text-align: center; margin: 24px 0;">
<a href="${process.env.NEXTAUTH_URL}/dashboard/billing" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Activar plan</a>
</div>

Tus clientes, certificados y datos te esperan.`;

  return { subject: "Tu prueba en CertiRecicla ha expirado", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function subscriptionActivatedEmail({ companyName, planName }: { companyName: string; planName: string }): { subject: string; html: string } {
  const body = `Hola equipo de <strong>${companyName}</strong>,

Tu suscripción al plan <strong>${planName}</strong> ha sido activada exitosamente.

<div style="background: #f4f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0;">Ya puedes disfrutar de todos los beneficios de tu plan. Gracias por confiar en CertiRecicla.</p>
</div>

Si tienes alguna consulta sobre tu plan, responde a este correo.`;

  return { subject: "Suscripción activada — CertiRecicla", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function subscriptionCancelledEmail({ companyName }: { companyName: string }): { subject: string; html: string } {
  const body = `Hola equipo de <strong>${companyName}</strong>,

Tu suscripción en CertiRecicla ha sido cancelada. Tu cuenta seguirá activa con funcionalidad limitada.

Si fue un error o cambias de opinión, puedes reactivar tu plan en cualquier momento desde la sección de facturación.

<div style="text-align: center; margin: 24px 0;">
<a href="${process.env.NEXTAUTH_URL}/dashboard/billing" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Reactivar plan</a>
</div>

Te extrañaremos. Tus datos seguirán seguros esperándote.`;

  return { subject: "Suscripción cancelada — CertiRecicla", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function paymentFailedEmail({ companyName }: { companyName: string }): { subject: string; html: string } {
  const body = `Hola equipo de <strong>${companyName}</strong>,

No pudimos procesar el pago de tu suscripción en CertiRecicla. Intentaremos nuevamente en los próximos días.

<div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0;">Para evitar interrupciones en tu servicio, verifica que tu método de pago esté actualizado.</p>
</div>

Si necesitas ayuda, responde a este correo.`;

  return { subject: "Problema con tu pago — CertiRecicla", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function teamInvitationEmail({ inviterName, companyName, tempPassword, loginUrl }: { inviterName: string; companyName: string; tempPassword: string; loginUrl: string }): { subject: string; html: string } {
  const body = `Hola,

<strong>${inviterName}</strong> te ha invitado a unirte al equipo de <strong>${companyName}</strong> en CertiRecicla.

<div style="background: #f4f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0;"><strong>Tu contraseña temporal:</strong> ${tempPassword}</p>
<p style="margin: 8px 0 0; font-size: 13px; color: #666;">Te recomendamos cambiarla después de tu primer inicio de sesión.</p>
</div>

<div style="text-align: center; margin: 24px 0;">
<a href="${loginUrl}" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Iniciar sesión</a>
</div>`;

  return { subject: `Te invitaron a ${companyName} en CertiRecicla`, html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function onboardingDay1Email({ userName }: { userName: string }): { subject: string; html: string } {
  const body = `Hola <strong>${userName}</strong>,

¿Ya agregaste tu primer cliente? En CertiRecicla el flujo es simple:

<div style="background: #f4f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0;"><strong>1.</strong> Agrega un cliente con sus datos básicos</p>
<p style="margin: 8px 0 0;"><strong>2.</strong> Registra retiros de reciclaje (material, kg, fecha)</p>
<p style="margin: 4px 0 0;"><strong>3.</strong> Genera un certificado con CO₂ calculado automáticamente</p>
</div>

<div style="text-align: center; margin: 24px 0;">
<a href="${process.env.NEXTAUTH_URL}/dashboard/clients" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Ir a Clientes</a>
</div>

Si necesitas ayuda, responde a este correo.`;

  return { subject: "¿Ya agregaste tu primer cliente? — CertiRecicla", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function onboardingDay3Email({ userName }: { userName: string }): { subject: string; html: string } {
  const body = `Hola <strong>${userName}</strong>,

¿Sabías que puedes importar tus datos desde Excel? Si ya tienes una planilla con clientes o retiros, súbela directamente y ahorra tiempo.

<div style="background: #f4f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0;"><strong>Tip:</strong> Descarga nuestra plantilla de ejemplo, llénala con tus datos y súbela en un click.</p>
</div>

<div style="text-align: center; margin: 24px 0;">
<a href="${process.env.NEXTAUTH_URL}/dashboard/records?import=true" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Subir Excel</a>
</div>

Saludos,
El equipo de CertiRecicla`;

  return { subject: "Tip: importa tus datos desde Excel — CertiRecicla", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function onboardingDay7Email({ userName }: { userName: string }): { subject: string; html: string } {
  const body = `Hola <strong>${userName}</strong>,

Generar tu primer certificado toma menos de 2 minutos:

<div style="background: #f4f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0;"><strong>1.</strong> Selecciona un cliente y un rango de fechas</p>
<p style="margin: 8px 0 0;"><strong>2.</strong> Revisa los datos y el CO₂ calculado</p>
<p style="margin: 4px 0 0;"><strong>3.</strong> Publica y envía el certificado por email</p>
</div>

<div style="text-align: center; margin: 24px 0;">
<a href="${process.env.NEXTAUTH_URL}/dashboard/certificates" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Crear certificado</a>
</div>

Tus clientes valorarán recibir evidencia verificable de su impacto ambiental.`;

  return { subject: "Tu primer certificado en 2 minutos — CertiRecicla", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function onboardingDay12Email({ userName }: { userName: string }): { subject: string; html: string } {
  const body = `Hola <strong>${userName}</strong>,

Tu periodo de prueba en CertiRecicla vence en <strong>2 días</strong>. Esperamos que hayas podido explorar la plataforma.

<div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0; font-weight: 600;">Al activar un plan mantienes:</p>
<p style="margin: 8px 0 0;">✓ Todos tus clientes y datos de retiros</p>
<p style="margin: 4px 0 0;">✓ Certificados ilimitados según tu plan</p>
<p style="margin: 4px 0 0;">✓ Portal de clientes y reportes automáticos</p>
<p style="margin: 4px 0 0;">✓ Branding personalizado en certificados (colores, logo, firma)</p>
</div>

<div style="text-align: center; margin: 24px 0;">
<a href="${process.env.NEXTAUTH_URL}/dashboard/billing" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Ver planes</a>
</div>

Si tienes dudas sobre qué plan elegir, responde a este correo y te ayudamos.`;

  return { subject: "Tu trial vence en 2 días — CertiRecicla", html: buildEmailHtml(body, PLATFORM_NAME) };
}

export function portalLinkEmail({ companyName, clientName, portalUrl }: { companyName: string; clientName: string; portalUrl: string }): { subject: string; html: string } {
  const body = `Hola equipo de <strong>${clientName}</strong>,

<strong>${companyName}</strong> te ha compartido acceso a tu portal de reciclaje en CertiRecicla, donde puedes consultar tus certificados y estadísticas de impacto ambiental.

<div style="text-align: center; margin: 24px 0;">
<a href="${portalUrl}" style="background-color: #4a6b4e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Acceder al portal</a>
</div>

Este enlace es exclusivo para ti. No lo compartas con terceros.`;

  return { subject: `Tu portal de reciclaje — ${companyName}`, html: buildEmailHtml(body, companyName) };
}
