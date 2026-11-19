async function verifyEndpoints() {
  const urls = [
    'http://localhost:3000/',
    'http://localhost:3000/doctors',
    'http://localhost:3000/lab-tests',
    'http://localhost:3000/health-packages',
    'http://localhost:3000/api/v1/health',
    'http://localhost:3000/api/v1/branches',
    'http://localhost:3000/api/v1/doctors',
    'http://localhost:3000/api/v1/me'
  ]

  console.log('--- TESTING RUNNING LOCAL NEXT.JS APPLICATION ---')
  for (const url of urls) {
    try {
      const start = Date.now()
      const res = await fetch(url)
      const elapsed = Date.now() - start
      console.log(`[HTTP ${res.status}] ${url} (${elapsed}ms)`)
      if (url.includes('/api/v1/')) {
        const body = await res.json()
        console.log(`  -> API Response: success=${body.success}, hasData=${Boolean(body.data)}, error=${body.error ? body.error.code : 'null'}`)
      }
    } catch (e) {
      console.error(`[FAILED] ${url}:`, e.message)
    }
  }
  console.log('--- END OF HTTP ENDPOINT VERIFICATION ---')
}

verifyEndpoints()
