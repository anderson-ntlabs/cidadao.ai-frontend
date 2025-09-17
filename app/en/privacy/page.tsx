export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Cidadão.AI is committed to protecting your privacy. This policy describes how we 
            collect, use, and protect your information when using our public transparency system.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-medium mb-2">2.1 Usage Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Anonymous browsing data (pages visited, time spent)</li>
            <li>Device type and browser</li>
            <li>Language and theme preferences</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2">2.2 Investigation Data</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Public data queries performed</li>
            <li>Generated reports (without personal data)</li>
            <li>Aggregated usage statistics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Improve user experience</li>
            <li>Optimize system performance</li>
            <li>Generate aggregated statistics on public transparency</li>
            <li>Detect and prevent fraud or abuse</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Protection</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information, 
            including:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Data encryption in transit (HTTPS)</li>
            <li>Restricted data access</li>
            <li>Continuous security monitoring</li>
            <li>Data anonymization whenever possible</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Sharing</h2>
          <p>
            <strong>We do not sell, rent, or share your personal data.</strong> 
            Aggregated and anonymized data may be shared publicly to promote 
            government transparency.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p>Under LGPD (Brazilian General Data Protection Law), you have the right to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Access your data</li>
            <li>Correct incorrect information</li>
            <li>Request data deletion</li>
            <li>Revoke consent</li>
            <li>Request data portability</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
          <p>
            We use essential cookies for site functionality. For more details, 
            see our <a href="/en/cookies" className="text-green-600 hover:underline">Cookie Policy</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Policy Changes</h2>
          <p>
            We may update this policy periodically. We will notify you of significant changes 
            through the website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
          <p>
            For privacy questions, contact us through our system or open an issue on 
            <a href="https://github.com/anderson-ufrj/cidadao.ai-hub" className="text-green-600 hover:underline"> GitHub</a>.
          </p>
        </section>
      </div>
    </div>
  )
}