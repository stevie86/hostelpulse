export const EnvVars = {
  SITE_NAME: 'HostelPulse',
  OG_IMAGES_URL: process.env.NEXT_PUBLIC_BASE_URL + '/og-images/',
  URL: process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  MAILCHIMP_SUBSCRIBE_URL: process.env.MAILCHIMP_SUBSCRIBE_URL || '',
};
