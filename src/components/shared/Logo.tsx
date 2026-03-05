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

const taglines: Record<string, string> = {
  en: 'Private Tours in Prague & Czech Republic',
  ru: 'Индивидуальные экскурсии по Праге и Чехии',
}

export function Logo({ variant = 'default', locale = 'en' }: { variant?: LogoVariant; locale?: string }) {
  return (
    <div className={variant === 'default' ? 'text-center' : undefined}>
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
  )
}
