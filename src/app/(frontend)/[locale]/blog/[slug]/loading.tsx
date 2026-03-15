export default function BlogPostLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-32 bg-gray-light/50 rounded mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        <div>
          {/* Category badge */}
          <div className="h-6 w-24 bg-gold/10 rounded mb-4" />
          {/* Title */}
          <div className="h-12 w-full bg-gray-light/50 rounded mb-2" />
          <div className="h-12 w-2/3 bg-gray-light/50 rounded mb-8" />
          {/* Hero image */}
          <div className="aspect-[16/9] bg-gray-light/50 rounded-xl mb-10" />
          {/* Content lines */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-light/50 rounded" />
            <div className="h-4 w-full bg-gray-light/50 rounded" />
            <div className="h-4 w-5/6 bg-gray-light/50 rounded" />
            <div className="h-4 w-full bg-gray-light/50 rounded" />
            <div className="h-4 w-4/5 bg-gray-light/50 rounded" />
            <div className="h-4 w-full bg-gray-light/50 rounded" />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div className="bg-white rounded-xl border border-gray-light/50 p-5">
              <div className="h-5 w-24 bg-gray-light/50 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-light/50 rounded" />
                <div className="h-4 w-3/4 bg-gray-light/50 rounded" />
                <div className="h-4 w-5/6 bg-gray-light/50 rounded" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
