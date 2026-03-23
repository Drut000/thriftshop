export default function HomePage() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6 px-4">
        {/* Logo / Brand */}
        <h1 className="font-display text-display-lg md:text-display-xl text-espresso-900">
          Thrift Store
        </h1>
        
        {/* Tagline */}
        <p className="text-lg md:text-xl text-espresso-600 max-w-md mx-auto">
          Curated vintage & secondhand fashion.
          <br />
          Every piece is one-of-a-kind.
        </p>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 text-sage-700 text-sm font-medium">
          <span className="w-2 h-2 bg-sage-500 rounded-full animate-pulse" />
          Coming Soon
        </div>

        {/* Dev info */}
        <div className="pt-8 text-sm text-espresso-400">
          <p>Development environment active</p>
          <p className="font-mono text-xs mt-1">
            Next.js + Tailwind + Prisma + Supabase
          </p>
        </div>
      </div>
    </main>
  );
}
