import { Link } from 'react-router-dom'
import wormImg from '../assets/hero.png'

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 to-cream">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiM4YjY1NDQiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] opacity-40" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:py-28">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block rounded-full bg-leaf-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-leaf-700">
              Sustainable Agriculture
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-earth-900 sm:text-5xl lg:text-6xl">
              Transform Waste <br className="hidden sm:inline" />
              Into <span className="text-leaf-600">Earth&apos;s Gold</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-earth-700 lg:mx-0">
              Harness the power of earthworms to convert organic waste into nutrient-rich soil amendment. Clean, sustainable, and incredibly effective.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                to="/how-it-works"
                className="rounded-full bg-earth-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-earth-800/20 transition-all hover:bg-earth-900 hover:shadow-xl"
              >
                Get Started Today
              </Link>
              <Link
                to="/benefits"
                className="rounded-full border-2 border-earth-300 bg-white/70 px-6 py-3 text-sm font-semibold text-earth-800 backdrop-blur-sm transition-all hover:border-earth-400 hover:bg-white"
              >
                Explore Benefits
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
              {[
                { val: '60%', label: 'Disease Reduction' },
                { val: '3-4x', label: 'More Nutrients' },
                { val: '0', label: 'Chemical Waste' },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-earth-900">{stat.val}</div>
                  <div className="text-xs text-earth-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex-1">
            <div className="absolute -inset-4 rounded-full bg-leaf-200/50 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-earth-900/10">
              <div className="aspect-square w-full max-w-md">
                <img
                  src={wormImg}
                  alt="Vermicompost earthworm"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl">
              Why Choose Vermicompost?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-earth-700">
              Vermicompost is nature&apos;s most potent fertilizer, created by earthworms converting organic matter into plant-available nutrients.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: '🌱',
                title: 'Rich in Nutrients',
                desc: 'Contains nitrogen, phosphorus, potassium, and beneficial microorganisms that plants need to thrive.',
              },
              {
                icon: '💧',
                title: 'Improves Soil Health',
                desc: 'Enhances soil structure, aeration, and water retention. Creates the perfect environment for root growth.',
              },
              {
                icon: '♻️',
                title: 'Zero Waste Solution',
                desc: 'Transforms kitchen scraps and yard waste into valuable resources while reducing landfill burden.',
              },
              {
                icon: '🛡️',
                title: 'Disease Suppression',
                desc: 'Worm castings contain enzymes that help protect plants from soil-borne diseases and pests.',
              },
              {
                icon: '🌍',
                title: 'Climate Friendly',
                desc: 'Carbon-negative process that sequesters carbon in soil and reduces methane from landfills.',
              },
              {
                icon: '⚡',
                title: 'Fast Acting',
                desc: 'Plants show visible improvement within weeks. Nutrients are immediately bioavailable to roots.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-earth-200 bg-white p-6 shadow-sm transition-all hover:border-leaf-300 hover:shadow-lg hover:shadow-leaf-900/5"
              >
                <div className="mb-4 text-3xl">{item.icon}</div>
                <h3 className="text-lg font-semibold text-earth-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-earth-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
