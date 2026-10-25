import UnsubscribeForm from './UnsubscribeForm'

export const metadata = { title: 'Unsubscribe', robots: { index: false } }

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return <div className="tr-wrap tr-wrap--narrow tr-sec"><h1 className="tr-display">Email preferences</h1><UnsubscribeForm token={token} /></div>
}
