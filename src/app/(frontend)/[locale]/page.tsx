export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">
        {locale === 'ru' ? 'Лучший гид по Праге' : 'Best Prague Guide'}
      </h1>
    </main>
  )
}
