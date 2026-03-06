import { getProcessStepIcon } from '@/lib/icon-map'
import type { HomepageData } from '@/lib/cms-types'

interface ProcessStepsProps {
  data: HomepageData
}

export function ProcessSteps({ data }: ProcessStepsProps) {
  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy text-center mb-12">
          {data.processHeading}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.processSteps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Step icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-4">
                {getProcessStepIcon(step.icon)}
              </div>

              {/* Step number badge */}
              <div className="text-xs font-bold text-gold uppercase tracking-wider mb-2">
                {index + 1}
              </div>

              <h3 className="text-lg font-heading font-semibold text-navy mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
