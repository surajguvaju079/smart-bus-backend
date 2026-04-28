// services/templates/welcomeTemplate.ts
export const welcomeTemplate = (name: string) => {
  return `
    <h2>Welcome to Ride App 🚗</h2>
    <p>Hello ${name},</p>
    <p>Your account has been created successfully.</p>
    <p>
      <a  style="background:#4CAF50;color:white;padding:10px 15px;text-decoration:none;">
        Set Your Password
      </a>
    </p>
    <p>This link will expire in 24 hours.</p>
  `;
};
