const steps = [
  {
    num: '01',
    title: 'Choose Container',
    desc: 'Use a plastic or wooden bin with drainage holes and a secure lid. A 10–20 gallon container works well for beginners.',
  },
  {
    num: '02',
    title: 'Add Bedding',
    desc: 'Fill with shredded newspaper, coconut fiber, or peat moss. Moisten to the consistency of a wrung-out sponge.',
  },
  {
    num: '03',
    title: 'Introduce Worms',
    desc: 'Red wiggler worms (Eisenia fetida) are most effective. Start with 500–1000 worms per square foot of surface.',
  },
  {
    num: '04',
    title: 'Feed Regularly',
    desc: 'Add fruit and vegetable scraps, coffee grounds, and crushed eggshells. Avoid meat, dairy, and oily foods.',
  },
  {
    num: '05',
    title: 'Harvest Castings',
    desc: 'After 3–4 months, separate worm castings from worms. Your black gold is ready to supercharge any garden.',
  },
]

export default function HowItWorks() {
  return (
    <div className="flex flex-col gap-16">
      <section className="text-center">
        <span className="inline-block rounded-full bg-leaf-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-leaf-700">
          Simple Process
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl">
          How It Works
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-earth-700">
          Following these five simple steps will have you producing nutrient-rich vermicompost at home in just a few months.
        </p>
      </section>

      <section className="mx-auto w-full max-w-3xl">
        <div className="relative">
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-leaf-300 via-leaf-200 to-transparent sm:left-8" />
          <div className="flex flex-col gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative flex gap-6">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-leaf-600 text-sm font-bold text-white shadow-lg shadow-leaf-900/20 sm:h-14 sm:w-14 sm:text-base">
                  {step.num}
                </div>
                <div className="flex-1 rounded-2xl border border-earth-200 bg-white p-6 shadow-sm transition-all hover:border-leaf-300 hover:shadow-md">
                  <h3 className="text-lg font-semibold text-earth-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-earth-700">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-earth-800 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to Start Your Vermicompost Journey?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-earth-200">
          Join thousands of home gardeners and sustainable farmers who are already producing their own organic fertilizer.
        </p>
        <a
          href="/contact"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-earth-800 shadow-lg transition-all hover:bg-leaf-50 hover:shadow-xl"
        >
          Get In Touch
        </a>
      </section>
    </div>
  )
}
