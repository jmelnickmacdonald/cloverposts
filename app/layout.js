import './globals.css'

export const metadata = {
  title: 'CloverPosts',
  description: 'Your social media sidekick',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
