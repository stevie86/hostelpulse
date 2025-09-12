import { getMessages } from '../i18n';

describe('i18n.getMessages', () => {
  it('returns English messages for en locale', async () => {
    const msgs = await getMessages('en');
    expect(msgs).toBeDefined();
    expect(msgs.common?.loading).toBe('Loading...');
  });

  it('falls back to English for missing locale', async () => {
    const msgs = await getMessages('pt');
    expect(msgs.common?.loading).toBe('Loading...');
  });
});

