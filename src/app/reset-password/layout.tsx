import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description: "Restablece la contraseña de tu cuenta de CertiRecicla.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
