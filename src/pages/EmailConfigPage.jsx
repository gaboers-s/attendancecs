import MainLayout from '@/components/layout/MainLayout'
import EmailConfigForm from '@/components/config/EmailConfigForm'

export default function EmailConfigPage() {
  return (
    <MainLayout>
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">EmailJS configuration</h1>
          <p className="mt-2 text-sm text-slate-500">
            Store your EmailJS service, template, and public key so the app can send account and certificate emails.
          </p>
        </div>

        <EmailConfigForm />
      </main>
    </MainLayout>
  )
}
