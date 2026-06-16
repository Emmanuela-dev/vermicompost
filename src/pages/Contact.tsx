import { useState } from 'react'

export default function Contact() {
  const [status, setStatus] = useState('')
  return (
    <div className="flex flex-col gap-16">
      <section className="text-center">
        <span className="inline-block rounded-full bg-leaf-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-leaf-700">
          Get In Touch
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-earth-700">
          Have questions about vermicomposting? Looking to start your own operation? We&apos;d love to hear from you.
        </p>
      </section>

      <section className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-earth-200 bg-white p-6 shadow-sm sm:p-10">
          <form onSubmit={(e) => { e.preventDefault(); setStatus('Message sent! We will get back to you soon.') }} className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium text-earth-900">Full Name</label>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 placeholder-earth-400 outline-none transition-all focus:border-leaf-400 focus:ring-2 focus:ring-leaf-100"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-earth-900">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 placeholder-earth-400 outline-none transition-all focus:border-leaf-400 focus:ring-2 focus:ring-leaf-100"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="text-sm font-medium text-earth-900">Subject</label>
              <select
                id="subject"
                name="subject"
                className="rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 outline-none transition-all focus:border-leaf-400 focus:ring-2 focus:ring-leaf-100"
              >
                <option>General Inquiry</option>
                <option>Starting a Worm Farm</option>
                <option>Commercial Partnership</option>
                <option>Technical Support</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-medium text-earth-900">Your Message</label>
              <textarea
                id="message"
                name="message"
                required
                placeholder="Tell us how we can help..."
                rows={6}
                className="rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 placeholder-earth-400 outline-none transition-all focus:border-leaf-400 focus:ring-2 focus:ring-leaf-100"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-earth-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-earth-800/20 transition-all hover:bg-earth-900 hover:shadow-xl"
            >
              Send Message
            </button>
            {status && (
              <div className="rounded-xl bg-leaf-50 p-4 text-center text-sm font-medium text-leaf-700">
                {status}
              </div>
            )}
          </form>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          { icon: '📧', title: 'Email', val: 'hello@vermicompost.earth' },
          { icon: '📍', title: 'Location', val: 'Sustainable Farm, Earth' },
          { icon: '📞', title: 'Phone', val: '+1 (555) 123-4567' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-earth-200 bg-white p-6 text-center shadow-sm">
            <span className="mb-3 block text-2xl">{item.icon}</span>
            <div className="text-xs font-medium uppercase tracking-wider text-earth-500">{item.title}</div>
            <div className="mt-1 text-sm font-semibold text-earth-900">{item.val}</div>
          </div>
        ))}
      </section>
    </div>
  )
}
