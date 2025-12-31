export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
