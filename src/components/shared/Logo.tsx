type LogoVariant = 'sm' | 'default' | 'footer'

const brandSizeClass: Record<LogoVariant, string> = {
  sm: 'text-[22px]',
  default: 'text-[36px]',
  footer: 'text-[28px]',
}

const brandColorClass: Record<LogoVariant, string> = {
  sm: 'text-navy',
  default: 'text-navy',
  footer: 'text-white',
}

const taglineColorClass: Record<LogoVariant, string> = {
  sm: '',
  default: 'text-gray',
  footer: 'text-white/40',
}

export function Logo({ variant = 'default' }: { variant?: LogoVariant }) {
  const showTagline = variant !== 'sm'

  return (
    <div className={variant === 'default' ? 'text-center' : undefined}>
      <div
        className={`font-heading font-semibold leading-none tracking-[1px] ${brandSizeClass[variant]} ${brandColorClass[variant]}`}
      >
        Best <em className="text-gold font-medium italic">Prague</em> Guide
      </div>
      {showTagline && (
        <div
          className={`font-body font-normal text-[10px] tracking-[3.5px] uppercase mt-1.5 ${taglineColorClass[variant]}`}
        >
          Private Tours in Prague &amp; Czech Republic
        </div>
      )}
    </div>
  )
}
