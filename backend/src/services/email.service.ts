import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMagicLinkEmail(to: string, token: string) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${frontendUrl}/auth/verify?token=${token}`;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Magic link for ${to}: ${link}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@portalflow.com',
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
}
