export default function SystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">System</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Technical Architecture</h2>
          <p>
            Cidadão.AI is built with a modern, scalable architecture designed to handle 
            millions of requests while maintaining security and performance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Backend</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>FastAPI (Python)</li>
                <li>PostgreSQL Database</li>
                <li>Redis Cache</li>
                <li>JWT Authentication</li>
                <li>RESTful API</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Frontend</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Next.js 15</li>
                <li>React 18</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>PWA Support</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">AI Agents System</h2>
          <p>
            Our multi-agent system consists of 17 specialized AIs, each with specific 
            responsibilities in the transparency ecosystem:
          </p>
          
          <div className="mt-6 space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold">Core Agents</h3>
              <p>Zumbi, Anita, and Tiradentes lead anomaly detection, analysis, and reporting.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold">Support Agents</h3>
              <p>14 specialized agents handle specific domains like health, education, and infrastructure.</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold">Coordination</h3>
              <p>Agents communicate through an event-driven architecture for real-time collaboration.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Sources</h2>
          <p>We integrate with multiple government transparency portals and APIs:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Federal Transparency Portal</li>
            <li>States' transparency systems</li>
            <li>Municipal open data</li>
            <li>Federal Revenue Service data</li>
            <li>Electoral Court information</li>
            <li>Public bidding platforms</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Security & Privacy</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Data Protection</h3>
              <p>All data is encrypted in transit and at rest. We follow LGPD guidelines strictly.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p>JWT-based authentication with refresh tokens and secure session management.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Monitoring</h3>
              <p>24/7 monitoring with Prometheus, Grafana, and automated alerting systems.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Performance & Scalability</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-green-600">&lt; 200ms</p>
              <p className="text-sm">Average response time</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">99.9%</p>
              <p className="text-sm">Uptime SLA</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">10k+</p>
              <p className="text-sm">Concurrent users</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">API Access</h2>
          <p>
            Our RESTful API is publicly available for developers and researchers:
          </p>
          <div className="bg-gray-900 text-white p-6 rounded-lg mt-4 font-mono text-sm">
            <p className="text-green-400"># Get system health</p>
            <p>GET https://cidadao-api-production.up.railway.app/health</p>
            <p className="mt-3 text-green-400"># Access API documentation</p>
            <p>GET https://cidadao-api-production.up.railway.app/docs</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Open Source</h2>
          <p>
            All our code is open source under the MIT license. Explore our repositories:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>
              <a href="https://github.com/anderson-ufrj/cidadao.ai-backend" 
                 className="text-green-600 hover:underline">
                Backend Repository
              </a>
            </li>
            <li>
              <a href="https://github.com/anderson-ufrj/cidadao.ai-frontend" 
                 className="text-green-600 hover:underline">
                Frontend Repository
              </a>
            </li>
            <li>
              <a href="https://github.com/anderson-ufrj/cidadao.ai-models" 
                 className="text-green-600 hover:underline">
                AI Models Repository
              </a>
            </li>
          </ul>
        </section>
      </div>
      </div>
    </div>
  )
}