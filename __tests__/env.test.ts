import { EnvVars } from '../env';

describe('EnvVars', () => {
  it('exposes required public config keys', () => {
    expect(EnvVars.SITE_NAME).toEqual(expect.any(String));
    expect(EnvVars.OG_IMAGES_URL).toEqual(expect.any(String));
    expect(EnvVars.URL).toEqual(expect.any(String));
    expect(EnvVars.MAILCHIMP_SUBSCRIBE_URL).toEqual(expect.any(String));
  });
});

