import Head from 'next/head'

export default function ApiDocs() {
  return (
    <html>
      <Head>
        <title>Hostelpulse API Docs</title>
        <meta name="robots" content="noindex" />
        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
      </Head>
      <body>
        <redoc spec-url="/docs/openapi.json"></redoc>
      </body>
    </html>
  )
}

