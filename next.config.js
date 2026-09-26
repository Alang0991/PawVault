/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/help/getting-started/create-account',
        destination: '/help/articles/account-creation',
        permanent: true,
      },
      {
        source: '/help/getting-started/email-verification',
        destination: '/help/articles/email-verification-login',
        permanent: true,
      },
      {
        source: '/help/getting-started/navigation',
        destination: '/help/articles/marketplace-navigation',
        permanent: true,
      },
      {
        source: '/help/getting-started/profile-setup',
        destination: '/help/articles/profile-setup',
        permanent: true,
      },
      {
        source: '/help/getting-started/user-roles',
        destination: '/help/articles/user-roles',
        permanent: true,
      },
      {
        source: '/help/buying/purchase-products',
        destination: '/help/articles/purchasing',
        permanent: true,
      },
      {
        source: '/help/buying/access-downloads',
        destination: '/help/articles/downloads',
        permanent: true,
      },
      {
        source: '/help/buying/download-issues',
        destination: '/help/articles/download-troubleshooting',
        permanent: true,
      },
      {
        source: '/help/buying/manage-orders',
        destination: '/help/articles/orders',
        permanent: true,
      },
      {
        source: '/help/buying/history-receipts',
        destination: '/help/articles/receipts',
        permanent: true,
      },
      {
        source: '/help/buying/updates',
        destination: '/help/articles/product-updates',
        permanent: true,
      },
      {
        source: '/help/selling/create-storefront',
        destination: '/help/articles/create-store',
        permanent: true,
      },
      {
        source: '/help/selling/upload-products',
        destination: '/help/articles/upload-product',
        permanent: true,
      },
      {
        source: '/help/selling/categories-tags',
        destination: '/help/articles/categories-tags',
        permanent: true,
      },
      {
        source: '/help/selling/pricing-sales',
        destination: '/help/articles/pricing',
        permanent: true,
      },
      {
        source: '/help/selling/payouts',
        destination: '/help/articles/payouts',
        permanent: true,
      },
      {
        source: '/help/selling/dashboard',
        destination: '/help/articles/creator-dashboard',
        permanent: true,
      },
      {
        source: '/help/selling/bundles-collections',
        destination: '/help/articles/collections',
        permanent: true,
      },
      {
        source: '/help/selling/verified-creator',
        destination: '/help/articles/become-creator',
        permanent: true,
      },
      {
        source: '/help/payments/methods',
        destination: '/help/articles/purchasing',
        permanent: true,
      },
      {
        source: '/help/payments/fees',
        destination: '/help/articles/paid-products',
        permanent: true,
      },
      {
        source: '/help/payments/tax',
        destination: '/help/articles/paid-products',
        permanent: true,
      },
      {
        source: '/help/payments/account-security',
        destination: '/help/articles/sessions',
        permanent: true,
      },
      {
        source: '/help/payments/fraud-prevention',
        destination: '/help/articles/suspicious-activity',
        permanent: true,
      },
      {
        source: '/help/payments/payment-info',
        destination: '/help/articles/receipts',
        permanent: true,
      },
      {
        source: '/help/refunds/policy',
        destination: '/help/articles/refunds',
        permanent: true,
      },
      {
        source: '/help/refunds/eligibility',
        destination: '/help/articles/refunds',
        permanent: true,
      },
      {
        source: '/help/refunds/request-refund',
        destination: '/help/articles/refunds',
        permanent: true,
      },
      {
        source: '/help/refunds/timeline',
        destination: '/help/articles/refunds',
        permanent: true,
      },
      {
        source: '/help/refunds/disputes',
        destination: '/help/articles/refunds',
        permanent: true,
      },
      {
        source: '/help/refunds/partial-full',
        destination: '/help/articles/refunds',
        permanent: true,
      },
      {
        source: '/help/legal/marketplace-guidelines',
        destination: '/help/articles/marketplace-rules',
        permanent: true,
      },
      {
        source: '/help/legal/community-guidelines',
        destination: '/help/articles/marketplace-rules',
        permanent: true,
      },
      {
        source: '/help/legal/creator-guidelines',
        destination: '/help/articles/marketplace-rules',
        permanent: true,
      },
      {
        source: '/help/legal/licensing',
        destination: '/help/articles/copyright-dmca',
        permanent: true,
      },
      {
        source: '/help/reporting/report-product',
        destination: '/help/articles/reporting-products',
        permanent: true,
      },
      {
        source: '/help/reporting/report-creator',
        destination: '/help/articles/reporting-creators',
        permanent: true,
      },
      {
        source: '/help/reporting/copyright',
        destination: '/help/articles/copyright-dmca',
        permanent: true,
      },
      {
        source: '/help/reporting/report-issue',
        destination: '/help/articles/reporting-products',
        permanent: true,
      },
      {
        source: '/help/reporting/safety',
        destination: '/help/articles/suspicious-activity',
        permanent: true,
      },
      {
        source: '/help/creator/selling-guide',
        destination: '/help/articles/become-creator',
        permanent: true,
      },
      {
        source: '/help/creator/store-customization',
        destination: '/help/articles/create-store',
        permanent: true,
      },
      {
        source: '/help/creator/file-management',
        destination: '/help/articles/product-files',
        permanent: true,
      },
      {
        source: '/help/creator/analytics',
        destination: '/help/articles/creator-dashboard',
        permanent: true,
      },
      {
        source: '/help/creator/coupons',
        destination: '/help/articles/pricing',
        permanent: true,
      },
      {
        source: '/help/creator/staff-picks',
        destination: '/help/articles/collections',
        permanent: true,
      },
      {
        source: '/help/creator/promotion',
        destination: '/help/articles/pricing',
        permanent: true,
      },
      {
        source: '/help/technical/browser-support',
        destination: '/help/articles/browser-compatibility',
        permanent: true,
      },
      {
        source: '/help/technical/download-help',
        destination: '/help/articles/download-troubleshooting',
        permanent: true,
      },
      {
        source: '/help/technical/webhooks',
        destination: '/help/articles/webhooks',
        permanent: true,
      },
      {
        source: '/help/technical/status',
        destination: '/help/articles/status-incidents',
        permanent: true,
      },
      {
        source: '/help/technical/mobile',
        destination: '/help/articles/browser-compatibility',
        permanent: true,
      },
      {
        source: '/help/tutorials/getting-started',
        destination: '/help/articles/account-creation',
        permanent: true,
      },
      {
        source: '/help/tutorials/create-product',
        destination: '/help/articles/upload-product',
        permanent: true,
      },
      {
        source: '/help/tutorials/api-guide',
        destination: '/help/articles/api',
        permanent: true,
      },
      {
        source: '/help/tutorials/advanced-store',
        destination: '/help/articles/create-store',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig