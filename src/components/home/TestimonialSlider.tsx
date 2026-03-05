'use client'

import { useState, useEffect, useCallback } from 'react'

interface Review {
  id: number
  customerName: string
  customerCountry?: string | null
  rating: number
  body: string
  tourTitle?: string
}

interface TestimonialSliderProps {
  reviews: Review[]
  heading: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={star <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          className={star <= rating ? 'text-gold' : 'text-gray-light'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export function TestimonialSlider({ reviews, heading }: TestimonialSliderProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % reviews.length)
  }, [reviews.length])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length)
  }, [reviews.length])

  // Auto-play
  useEffect(() => {
    if (paused || reviews.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [paused, next, reviews.length])

  if (reviews.length === 0) return null

  return (
    <section className="py-16 lg:py-24 bg-navy">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white text-center mb-12">
          {heading}
        </h2>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Review card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 sm:p-10 text-center min-h-[200px] flex flex-col items-center justify-center">
            <StarRating rating={reviews[current].rating} />

            <blockquote className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl">
              &ldquo;{reviews[current].body}&rdquo;
            </blockquote>

            <div className="mt-6">
              <p className="text-white font-medium">
                {reviews[current].customerName}
              </p>
              {reviews[current].customerCountry && (
                <p className="text-white/50 text-sm mt-1">
                  {reviews[current].customerCountry}
                </p>
              )}
              {reviews[current].tourTitle && (
                <p className="text-gold/80 text-sm mt-1">
                  {reviews[current].tourTitle}
                </p>
              )}
            </div>
          </div>

          {/* Navigation arrows */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Previous review"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Next review"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Dots */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === current ? 'bg-gold' : 'bg-white/30'
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
