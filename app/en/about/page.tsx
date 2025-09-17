export default function AboutPage() {
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
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">About Cidadão.AI</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Academic Context</h2>
          <p>
            Cidadão.AI is being developed as the final project for obtaining the Bachelor's degree 
            in Computer Science at the Federal Institute of Education, Science and Technology of 
            Southern Minas Gerais (IFSULDEMINAS) - Muzambinho Campus.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-4">
            <p className="mb-2"><strong>Student:</strong> Anderson Henrique da Silva</p>
            <p className="mb-2"><strong>Advisor:</strong> Prof. Dr. Aracele Garcia de Oliveira Fassbinder</p>
            <p><strong>Institution:</strong> IFSULDEMINAS - Campus Muzambinho</p>
            <p><strong>Course:</strong> Bachelor of Computer Science</p>
            <p><strong>Expected completion:</strong> 2025</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p>
            Democratize access to public data through artificial intelligence, 
            transforming complex information into clear and accessible insights for all citizens.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
          <p>
            To be the main reference in government transparency in Brazil, empowering 
            every citizen with the necessary tools to understand and monitor the use 
            of public resources.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
          <p>
            Cidadão.AI is a multi-agent artificial intelligence system that works 
            24/7 to:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Monitor government portals and transparency APIs</li>
            <li>Analyze public contracts and biddings</li>
            <li>Detect anomalies and irregularities in public spending</li>
            <li>Generate clear and accessible reports for citizens</li>
            <li>Answer questions about public data in simple language</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Technology and Innovation</h2>
          <p>
            We use cutting-edge technologies to ensure scalability, security, and efficiency:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li><strong>Multi-agent AI:</strong> 17 specialized agents with unique Brazilian identities</li>
            <li><strong>Modern Architecture:</strong> FastAPI, Next.js, and cloud infrastructure</li>
            <li><strong>Enterprise Security:</strong> JWT authentication and data encryption</li>
            <li><strong>Real-time Monitoring:</strong> Prometheus, Grafana, and distributed tracing</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Brazilian Cultural Approach</h2>
          <p>
            Our AI agents are inspired by important figures in Brazilian history, 
            creating a unique connection between advanced technology and our cultural identity:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li><strong>Zumbi dos Palmares:</strong> Leads the fight against corruption</li>
            <li><strong>Anita Garibaldi:</strong> Analyzes data with courage and precision</li>
            <li><strong>Tiradentes:</strong> Reports findings with clarity and independence</li>
            <li>And 14 other agents representing Brazilian diversity and history</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Open Source Commitment</h2>
          <p>
            Cidadão.AI is an open-source project under the MIT license. We believe 
            transparency should start with our own code. All our repositories are 
            publicly available on GitHub.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Join Us</h2>
          <p>
            Whether you're a developer, researcher, journalist, or engaged citizen, 
            there are many ways to contribute to the project:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Contribute code on GitHub</li>
            <li>Report bugs or suggest improvements</li>
            <li>Share the project on social media</li>
            <li>Use the platform and provide feedback</li>
          </ul>
        </section>
      </div>
      </div>
    </div>
  )
}