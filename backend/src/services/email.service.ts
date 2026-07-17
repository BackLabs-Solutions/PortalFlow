import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendMagicLinkEmail(to: string, token: string) {
  const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
  const link = `${dashboardUrl}/verify?token=${token}`;

  if (!resend) {
    console.log(`[DEV] Magic link for ${to}: ${link}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'PortalFlow <noreply@mail.backlab.fr>',
    to,
    subject: 'Votre lien de connexion PortalFlow',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Connexion à PortalFlow</h2>
        <p>Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien expire dans 15 minutes.</p>
        <a href="${link}" style="display: inline-block; background: #2c2c2a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Se connecter
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">Si vous n'avez pas demandé ce lien, ignorez cet email.</p>
      </div>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error('Failed to send magic link email');
  }
}
