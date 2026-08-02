import type { NextConfig } from 'next';

/**
 * Content-Security-Policy.
 *
 * Written out here rather than inline so the reasoning fits next to the value.
 *
 * `script-src` has to include `'unsafe-inline'`, and that is a real limitation, not an
 * oversight: every route in this app is statically prerendered, and a per-request nonce would
 * force dynamic rendering on all 377 pages — trading the entire performance model for a
 * directive whose main threat (injected inline script) is already ruled out by the fact that no
 * reader-supplied string is ever rendered as markup.
 *
 * The directives that *do* carry weight here are the ones below it: `object-src 'none'`,
 * `base-uri 'self'` and `form-action 'self'` close the classic CSP-bypass routes, and
 * `frame-ancestors` blocks clickjacking.
 *
 * `codesandbox.io` is allowed only for `frame-src` and `connect-src` because the playground
 * (Sandpack) executes code inside its sandboxed iframe. Nothing else may reach the network.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // Next inlines critical CSS; Tailwind emits no runtime styles beyond that.
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  // Only the playground talks to the network, and only to its own sandbox host.
  "connect-src 'self' https://*.codesandbox.io",
  "frame-src 'self' https://*.codesandbox.io",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Drop `X-Powered-By: Next.js`. Naming the framework and letting an attacker narrow the
  // version range is free reconnaissance that buys us nothing (security.md → Errors, Logging,
  // Monitoring & Detection: don't leak versions or implementation detail to the client).
  poweredByHeader: false,

  // typedRoutes is deliberately off: almost every link here is built from curriculum data
  // (`/kelas/${category}/${chapter}/${lesson}`), which typed routes cannot verify anyway. The
  // guarantee we actually want — that no internal link points at a missing lesson — is covered
  // by the curriculum integrity test instead, where it can be checked for real.

  // Security headers (.claude/rules/security.md → Errors, Logging, Monitoring & Detection).
  // These only take effect when the app is served by a Next.js server; a purely static host
  // must be configured to send the same headers itself.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
