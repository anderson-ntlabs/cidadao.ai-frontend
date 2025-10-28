import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Cidadão.AI',
  description: 'Cidadão.AI privacy policy. Learn how we protect your data and respect your privacy when using our public transparency system.',
  robots: 'index, follow',
  openGraph: {
    title: 'Privacy Policy - Cidadão.AI',
    description: 'How Cidadão.AI protects your data and privacy',
    type: 'website',
    locale: 'en_US',
  },
}

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

          <h3 className="text-xl font-medium mb-2">2.3 Usability Research Data (with consent)</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Interaction metrics (clicks, navigation, response time)</li>
            <li>AI agent usage patterns</li>
            <li>User experience feedback</li>
            <li>Anonymized data for scientific research on usability</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2">
            <strong>Important:</strong> Data collection for scientific research requires your
            explicit consent and can be declined at any time without affecting platform usage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Improve user experience</li>
            <li>Optimize system performance</li>
            <li>Generate aggregated statistics on public transparency</li>
            <li>Detect and prevent fraud or abuse</li>
            <li><strong>Conduct scientific research</strong> on usability and accessibility (with consent)</li>
            <li><strong>Publish aggregated results</strong> in academic papers and theses</li>
            <li><strong>Contribute to scientific advancement</strong> in digital public transparency</li>
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
          <h2 className="text-2xl font-semibold mb-4">8. Use for Scientific Research</h2>
          <p className="mb-4">
            Cidadão.AI is part of an academic research project on usability of public transparency systems.
            With your <strong>explicit consent</strong>, we may collect and use anonymized data for:
          </p>

          <h3 className="text-xl font-medium mb-2">8.1 Research Purposes</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Analysis of usage patterns and behavior (aggregated)</li>
            <li>Usability and user experience studies</li>
            <li>Digital accessibility research</li>
            <li>Development of methodologies for transparency systems</li>
            <li>Publication of scientific papers and dissertations</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">8.2 Privacy Guarantees in Research</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Complete anonymization:</strong> Personal data is removed or transformed into cryptographic hashes (SHA-256)</li>
            <li><strong>Aggregation:</strong> Published results only in aggregated form, never individual</li>
            <li><strong>Revocable consent:</strong> You can withdraw your consent at any time</li>
            <li><strong>No commercialization:</strong> Research data will never be sold or shared commercially</li>
            <li><strong>Transparency:</strong> Scientific publications will be shared publicly</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">8.3 Legal Basis (LGPD)</h3>
          <p className="mb-4">
            Data collection for scientific research is based on{' '}
            <strong>Article 7, IV of LGPD</strong>, which allows data processing for
            "conducting studies by research institutions, ensuring, whenever possible,
            the anonymization of personal data".
          </p>

          <h3 className="text-xl font-medium mb-2">8.4 How to Manage Your Consent</h3>
          <p>
            You can accept or decline data collection for research through the specific banner
            that appears when using the platform. Your choice does not affect access to system functionalities.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Policy Changes</h2>
          <p>
            We may update this policy periodically. We will notify you of significant changes
            through the website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
          <p>
            For privacy questions or about the use of data for research, contact us through our system or open an issue on{' '}
            <a href="https://github.com/anderson-ufrj/cidadao.ai-hub" className="text-green-600 hover:underline">GitHub</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
