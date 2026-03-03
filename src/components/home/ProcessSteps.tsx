import { getTranslations } from 'next-intl/server'

const stepIcons = [
  // Step 1: Submit
  <svg key="1" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>,
  // Step 2: Confirm
  <svg key="2" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>,
  // Step 3: Pay
  <svg key="3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>,
  // Step 4: Enjoy
  <svg key="4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>,
]

export async function ProcessSteps() {
  const t = await getTranslations('process')

  const steps = [
    { title: t('step1Title'), desc: t('step1Desc'), icon: stepIcons[0] },
    { title: t('step2Title'), desc: t('step2Desc'), icon: stepIcons[1] },
    { title: t('step3Title'), desc: t('step3Desc'), icon: stepIcons[2] },
    { title: t('step4Title'), desc: t('step4Desc'), icon: stepIcons[3] },
  ]

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy text-center mb-12">
          {t('heading')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-4">
                {step.icon}
              </div>

              {/* Step number badge */}
              <div className="text-xs font-bold text-gold uppercase tracking-wider mb-2">
                {index + 1}
              </div>

              <h3 className="text-lg font-heading font-semibold text-navy mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
