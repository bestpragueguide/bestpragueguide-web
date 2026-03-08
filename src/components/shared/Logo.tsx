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

const taglineClass: Record<LogoVariant, string> = {
  sm: 'text-[8px] tracking-[2.5px] text-[#999] mt-[3px]',
  default: 'text-[10px] tracking-[3.5px] text-[#999] mt-1.5',
  footer: 'text-[10px] tracking-[3.5px] text-[#666] mt-2',
}

const iconSizeClass: Record<LogoVariant, string> = {
  sm: 'w-7 h-7',
  default: 'w-10 h-10',
  footer: 'w-9 h-9',
}

const taglines: Record<string, string> = {
  en: 'Private Tours in Prague & Czech Republic',
  ru: 'Индивидуальные экскурсии по Праге и Чехии',
}

export function LogoMark({ variant = 'default', className = '' }: { variant?: LogoVariant; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`${iconSizeClass[variant]} ${className}`}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="6" fill="#1A1A1A" />
      <text
        x="16"
        y="22.5"
        textAnchor="middle"
        fill="#C4975C"
        fontFamily="'Cormorant Garamond',Georgia,serif"
        fontWeight="600"
        fontStyle="italic"
        fontSize="21"
      >
        B
      </text>
      <line x1="9" y1="25.5" x2="23" y2="25.5" stroke="#C4975C" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ variant = 'default', locale = 'en' }: { variant?: LogoVariant; locale?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark variant={variant} />
      <div>
        <div
          className={`font-heading font-semibold leading-none tracking-[1px] ${brandSizeClass[variant]} ${brandColorClass[variant]}`}
        >
          Best <em className="text-gold font-medium italic">Prague</em> Guide
        </div>
        <div
          className={`font-body font-normal uppercase ${taglineClass[variant]}`}
        >
          {taglines[locale] || taglines.en}
        </div>
      </div>
    </div>
  )
}
