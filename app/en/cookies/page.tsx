export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. What are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit our website. 
            They help us improve your browsing experience and ensure the site functions properly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
          <p>Cidadão.AI uses only essential cookies for:</p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">2.1 Essential Cookies</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Theme preference:</strong> Stores your choice between light/dark mode</li>
            <li><strong>Language:</strong> Maintains your language preference (PT/EN)</li>
            <li><strong>Session:</strong> Ensures continuity during your navigation</li>
            <li><strong>Security:</strong> Protects against CSRF attacks</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.2 Analytics Cookies (Optional)</h3>
          <p>
            We do not use tracking or analytics cookies. All metrics are collected 
            in an aggregated and anonymous manner, without identifying individual users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>
          <p>
            <strong>We do not use third-party cookies.</strong> We do not share data with 
            social networks, advertisers, or other external services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Managing Cookies</h2>
          <p>You can control and manage cookies through:</p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">4.1 Browser Settings</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
            <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
            <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
          </ul>
          
          <p className="mt-4">
            <strong>Note:</strong> Blocking essential cookies may affect site functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Cookie Duration</h2>
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Cookie</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Duration</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">theme</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">1 year</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Theme preference</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">locale</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">1 year</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Preferred language</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">session</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Session</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Continuous navigation</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Security</h2>
          <p>
            All cookies are transmitted over secure connection (HTTPS) and configured 
            with appropriate security flags (Secure, HttpOnly, SameSite).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Policy Changes</h2>
          <p>
            We may update this policy periodically. Significant changes will be 
            communicated through the cookie banner.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
          <p>
            For questions about our cookie policy, see our 
            <a href="/en/privacy" className="text-green-600 hover:underline"> Privacy Policy</a> or 
            contact us through GitHub.
          </p>
        </section>
      </div>
    </div>
  )
}