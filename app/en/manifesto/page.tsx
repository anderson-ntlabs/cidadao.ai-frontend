export default function ManifestoPage() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 relative bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: 'url(/operarios.png)',
      }}
    >
      {/* Overlay para melhorar legibilidade */}
      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Cidadão.AI Manifesto</h1>
        
        <h2 className="text-2xl font-semibold mb-8 text-center text-gray-700 dark:text-gray-300">
          🇧🇷 For an Artificial Intelligence that Serves the People and Illuminates the State
        </h2>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
        <p className="text-lg mb-6">
          Cidadão.AI is born from the desire to make public data truly public. In times where 
          information is power, democratizing access to government data is democratizing power itself.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Mission</h2>
        <p className="text-lg mb-6">
          Our mission is to create an artificial intelligence that works tirelessly to strengthen 
          transparency, fight corruption, and empower every citizen with clear, accurate, and 
          auditable information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Transparency as Radical Practice</h2>
        <p className="text-lg mb-6">
          We believe transparency is not just showing numbers, but making them understandable, 
          contextualized, and actionable. Our AI doesn't just collect data - it interprets, 
          analyzes patterns, and identifies anomalies.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Vision for the Future</h2>
        <p className="text-lg mb-8">
          We dream of a Brazil where every public real is traceable, where every government 
          decision is explainable, and where every citizen has the power to question, 
          understand, and oversee.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-lg my-10 border-l-4 border-yellow-500">
          <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200 text-center italic">
            "Transparency is not a favor. It is the foundation of a living democracy."
          </p>
          <p className="text-center mt-3 text-yellow-700 dark:text-yellow-300 font-medium">
            - Anderson H.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">We Believe That:</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Transparency is a fundamental right</strong> - Every citizen 
              has the right to know how their taxes are being used.
            </li>
            <li>
              <strong>Technology should democratize, not exclude</strong> - Artificial 
              intelligence should be a tool for social inclusion, not a barrier.
            </li>
            <li>
              <strong>Complexity is the enemy of transparency</strong> - Public data 
              should be presented clearly and accessibly to everyone.
            </li>
            <li>
              <strong>Civic vigilance strengthens democracy</strong> - An informed 
              society is a stronger and more just society.
            </li>
            <li>
              <strong>Cultural identity matters</strong> - Our Brazilian roots and 
              history should be reflected in the technologies we create.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Commitments:</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-1">With Citizens</h3>
              <p>To provide free, accessible, and reliable tools for monitoring public spending.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-1">With Transparency</h3>
              <p>To be transparent in our own processes, keeping our code open and documented.</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold mb-1">With Ethics</h3>
              <p>To use AI responsibly, always prioritizing the public interest.</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold mb-1">With Innovation</h3>
              <p>To continuously seek new ways to make public data more accessible.</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold mb-1">With Education</h3>
              <p>To educate and empower citizens to understand and use public information.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Call to Action</h2>
          <p className="mb-4">
            This manifesto is not just words - it's a call to action. We invite:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Citizens:</strong> Use our tools, ask questions, demand transparency.
            </li>
            <li>
              <strong>Developers:</strong> Contribute code, ideas, and improvements.
            </li>
            <li>
              <strong>Journalists:</strong> Use our data to tell important stories.
            </li>
            <li>
              <strong>Educators:</strong> Teach the importance of government transparency.
            </li>
            <li>
              <strong>Public servants:</strong> Work with us to improve access to public data.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">The Future We Want</h2>
          <p>
            We envision a Brazil where:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Every citizen can easily understand the public budget</li>
            <li>Corruption is detected and prevented in real-time</li>
            <li>Public decisions are based on transparent data</li>
            <li>Technology serves social justice</li>
            <li>Democracy is strengthened by informed participation</li>
          </ul>
        </section>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mt-12">
          <p className="text-center text-lg font-medium">
            "In the fight for transparency, every line of code is an act of citizenship."
          </p>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            - Cidadão.AI Team
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}