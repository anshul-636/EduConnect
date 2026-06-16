/**
 * ResetPassword.jsx
 *
 * This route is no longer used. The full password-reset flow
 * (enter email → receive OTP → set new password) is handled
 * entirely inside ForgotPassword.jsx, because the backend uses
 * OTP-based reset — not token links sent via email.
 *
 * We redirect anyone who lands here straight to /forgot-password.
 */
import { Navigate } from 'react-router-dom';
export default function ResetPassword() {
  return <Navigate to="/forgot-password" replace />;
}
