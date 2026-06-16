export default function Benefits() {
  return (
    <div className="flex flex-col gap-16">
      <section className="text-center">
        <span className="inline-block rounded-full bg-leaf-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-leaf-700">
          Why It Matters
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl">
          Benefits of Vermicompost
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-earth-700">
          Vermicompost outperforms traditional compost and chemical fertilizers across every key metric for sustainable agriculture.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: '🦠',
            title: 'Disease Suppression',
            desc: 'Worm castings have been shown to reduce soil-borne diseases in plants by up to 60% through natural antimicrobial enzymes.',
          },
          {
            icon: '🌱',
            title: 'Boosts Germination',
            desc: 'Seeds germinate faster and develop stronger root systems in vermicompost-enriched soil. See results in under 2 weeks.',
          },
          {
            icon: '🌐',
            title: 'Carbon Sequestration',
            desc: 'Stabilizes organic carbon in soil, helping mitigate climate change effects while improving long-term soil fertility.',
          },
          {
            icon: '💧',
            title: 'Superior Water Retention',
            desc: 'Enhances soil&apos;s water-holding capacity by up to 40%, significantly reducing irrigation needs.',
          },
          {
            icon: '🗑️',
            title: 'Zero Waste Solution',
            desc: 'Converts kitchen scraps, yard waste, and agricultural residues into valuable organic soil amendment.',
          },
          {
            icon: '⚖️',
            title: 'pH Neutral Formula',
            desc: 'Castings maintain a near-neutral pH of 6.5–7.0, ideal for a wide range of plants without soil amendments.',
          },
          {
            icon: '🐛',
            title: 'Rich Microbiome',
            desc: 'Contains beneficial bacteria, fungi, and enzymes that create a thriving soil ecosystem naturally.',
          },
          {
            icon: '💰',
            title: 'Cost Effective',
            desc: 'One of the most affordable soil amendments available. A small initial investment in worms pays dividends.',
          },
          {
            icon: '🌿',
            title: 'Non-Toxic & Safe',
            desc: 'Completely safe for children, pets, and wildlife. No chemical residues or harmful byproducts.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="group rounded-2xl border border-earth-200 bg-white p-6 shadow-sm transition-all hover:border-leaf-300 hover:shadow-lg hover:shadow-leaf-900/5"
          >
            <span className="mb-4 block text-3xl">{item.icon}</span>
            <h3 className="text-lg font-semibold text-earth-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-earth-700">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
