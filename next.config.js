
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig

module.exports = {
  redirects() {
    return [
      {
        source: '/',
        destination: '/singleplayer',
        permanent: true,
      }
    ]

  }
}