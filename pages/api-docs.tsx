import Head from 'next/head'
import Script from 'next/script'

export default function ApiDocs() {
  return (
    <>
      <Head>
        <title>Hostelpulse API Docs</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js" strategy="afterInteractive" />
      <redoc spec-url="/docs/openapi.json"></redoc>
    </>
  )
}
