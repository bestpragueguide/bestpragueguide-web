export default function TourDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-48 bg-gray-light/50 rounded mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          {/* Title */}
          <div className="h-10 w-3/4 bg-gray-light/50 rounded mb-4" />
          {/* Duration */}
          <div className="h-4 w-40 bg-gray-light/50 rounded mb-6" />
          {/* Gallery placeholder */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="col-span-4 aspect-[16/9] bg-gray-light/50 rounded-lg" />
          </div>
          {/* Description lines */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-light/50 rounded" />
            <div className="h-4 w-full bg-gray-light/50 rounded" />
            <div className="h-4 w-5/6 bg-gray-light/50 rounded" />
            <div className="h-4 w-full bg-gray-light/50 rounded" />
            <div className="h-4 w-3/4 bg-gray-light/50 rounded" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-light/50 p-6">
            <div className="h-5 w-24 bg-gray-light/50 rounded mb-4" />
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-gray-light/50 rounded" />
              <div className="h-4 w-full bg-gray-light/50 rounded" />
              <div className="h-4 w-3/4 bg-gray-light/50 rounded" />
            </div>
            <div className="bg-cream/50 rounded-lg p-3 mb-4">
              <div className="h-8 w-32 bg-gray-light/50 rounded mx-auto" />
            </div>
            <div className="space-y-3">
              <div className="h-10 w-full bg-gray-light/50 rounded-lg" />
              <div className="h-10 w-full bg-gray-light/50 rounded-lg" />
              <div className="h-10 w-full bg-gray-light/50 rounded-lg" />
              <div className="h-10 w-full bg-gray-light/50 rounded-lg" />
            </div>
            <div className="h-12 w-full bg-gold/30 rounded-lg mt-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
