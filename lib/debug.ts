export const isDev = process.env.NODE_ENV !== 'production'
const debugFlag = process.env.DEBUG_MODE || ''
export const debugMode = isDev && /^(1|true|on|yes)$/i.test(debugFlag)

export function debugLog(...args: any[]) {
  if (debugMode) {
    // Prefix to make logs easy to search in dev output
    // eslint-disable-next-line no-console
    console.info('[DEV:DEBUG]', ...args)
  }
}

