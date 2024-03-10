import React from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import Link from '@mui/material/Link';

export default function LoginButton() {
  return (
    <div className="logo-speeddial card p-card-grey p-overlay-badge shadow-5 border-round-lg p-3 background-primary">
      <div style={{ position: 'relative' }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => {
            void signIn('google', { callbackUrl: '/dashboard' });
          }}>
          <Image src="/logo.svg" width={150} height={150} alt="dropdown icon" />
        </Link>
      </div>
    </div>
  );
}
