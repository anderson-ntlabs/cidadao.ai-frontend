import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Cidadão.AI',
  description:
    'Cidadão.AI privacy policy under the Brazilian LGPD: what personal data we collect, why, for how long, who processes it, and how to exercise your rights.',
  robots: 'index, follow',
  openGraph: {
    title: 'Privacy Policy - Cidadão.AI',
    description: 'How Cidadão.AI protects your data and privacy',
    type: 'website',
    locale: 'en_US',
  },
}

const LAST_UPDATED = 'November 3, 2026'

export default function PrivacyPage(): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">Last updated: {LAST_UPDATED}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction and Data Controller</h2>
          <p>
            Cidadão.AI is an open-source public transparency platform that uses AI agents to help
            people analyse Brazilian public spending. This policy explains which personal data we
            process, why, for how long, who processes it on our behalf, and how you can exercise
            your rights under the Brazilian General Data Protection Law (LGPD, Lei 13.709/2018).
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium">Data controller</p>
            <p className="text-gray-600 dark:text-gray-400">
              Anderson Henrique da Silva (individual), Minas Gerais, Brazil
            </p>
            <p className="font-medium mt-2">Privacy contact (data protection officer role)</p>
            <p>
              <a href="mailto:andersonhs27@gmail.com" className="text-green-600 hover:underline">
                andersonhs27@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Personal Data We Collect</h2>
          <p>
            You can browse the public pages without an account. We only process personal data when
            you create an account or use the signed-in features.
          </p>

          <h3 className="text-xl font-medium mb-2 mt-4">2.1 Account data</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and email address.</li>
            <li>
              If you sign in with Google or GitHub: the name, email, profile picture URL and
              username that provider shares with us.
            </li>
            <li>Account creation date and last sign-in date.</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.2 Optional profile and preferences</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Theme, language, font size, accessibility and notification preferences.</li>
            <li>Profile picture and short bio, if you choose to add them.</li>
            <li>
              On the Ágora learning platform: course and institution enrolment details you choose to
              fill in, learning progress, points, badges, study sessions and diary entries.
            </li>
            <li>
              Your name, picture and points appear in the Ágora ranking, visible to other signed-in
              learners.
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.3 Chat messages and investigations</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              The messages a signed-in user writes to the AI agents, the agents&apos; answers and
              the investigations you create.
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.4 Consent records</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Date, version of the accepted text, IP address and browser identification (user agent)
              at the moment you accept the terms, so we can prove your consent.
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.5 Ágora Kids (parent accounts only)</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Parent&apos;s name and email, the child&apos;s first name or nickname and chosen
              avatar, session times, videos watched and agents used. Children do not have their own
              account or email. See section 8.
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.6 Technical and usage data</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Pages visited, device type, browser, language and approximate country/region.</li>
            <li>IP address, used for security and rate limiting.</li>
            <li>Error reports and performance metrics.</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.7 What we do not collect</h3>
          <p>
            We do not ask for CPF, RG or any other government identification number, nor for
            financial, health or biometric data. Please do not type such data, or personal data of
            other people, into the chat.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Purposes and Legal Bases (LGPD)</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>
                Creating and running your account, answering your chat messages and saving your
                history
              </strong>
              : performance of the service you requested (LGPD art. 7, V).
            </li>
            <li>
              <strong>Optional profile data, research analytics and session recording</strong>: your
              consent (art. 7, I), which you can withdraw at any time.
            </li>
            <li>
              <strong>Security, abuse prevention, rate limiting and error monitoring</strong>:
              legitimate interest (art. 7, IX and art. 10), limited to what is necessary.
            </li>
            <li>
              <strong>Academic research with anonymised data</strong>: studies by a research body
              (art. 7, IV), see section 11.
            </li>
            <li>
              <strong>Ágora Kids</strong>: specific consent given by a parent or legal guardian
              (art. 14, §1).
            </li>
            <li>
              <strong>Complying with legal obligations or requests from authorities</strong>: art.
              7, II.
            </li>
          </ul>
          <p className="mt-4">
            <strong>
              We do not sell or rent personal data and we do not use it for advertising.
            </strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Processors and Sub-processors</h2>
          <p>
            We share personal data only with the service providers needed to run the platform, each
            acting on our instructions:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Vercel Inc.</strong> (USA): hosting of this website; Vercel Web Analytics and
              Speed Insights (aggregated page and performance metrics).
            </li>
            <li>
              <strong>Supabase Inc.</strong>: database, authentication and file storage (account,
              profile, chat history, consent records).
            </li>
            <li>
              <strong>Railway Corp.</strong> (USA): hosting of the API that runs the AI agents.
            </li>
            <li>
              <strong>Large language model (LLM) provider configured in the API</strong>: receives
              the text of your chat messages to generate the answer. The current default provider is{' '}
              <strong>Maritaca AI</strong> (Brazil, Sabiá models). The API can be configured to use
              another provider (for example Groq, Anthropic, Together AI or Hugging Face); if the
              provider in use changes, this list will be updated.
            </li>
            <li>
              <strong>PostHog Inc.</strong> (USA): product analytics. Your user identifier is sent
              only as a SHA-256 hash, and session recording is enabled only with your consent, with
              all form fields masked.
            </li>
            <li>
              <strong>Functional Software Inc. (Sentry)</strong> (USA): error and performance
              monitoring.
            </li>
            <li>
              <strong>Resend</strong> (USA): delivery of the parental access code email (Ágora
              Kids).
            </li>
            <li>
              <strong>ipify</strong>: returns your public IP address when you record your Ágora
              consent.
            </li>
          </ul>
          <p className="mt-4">
            If you choose to sign in with Google or GitHub, those companies process your login under
            their own privacy policies. Some providers are located outside Brazil; such
            international transfers follow LGPD art. 33, relying on the providers&apos; data
            processing terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Retention Periods</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Account data, profile, preferences, chat history and investigations</strong>:
              kept while your account is active. Deleting your account in the app removes them
              immediately; if you ask by email, we delete them within 15 days. Copies in our
              providers&apos; backups are overwritten within 30 days.
            </li>
            <li>
              <strong>Consent records</strong>: kept for the life of the account and deleted
              together with it.
            </li>
            <li>
              <strong>Ágora Kids data</strong>: deleted together with the parent&apos;s account or
              at the parent&apos;s request.
            </li>
            <li>
              <strong>Analytics, error and security logs</strong>: kept by the providers listed
              above for at most 12 months.
            </li>
            <li>
              <strong>Course certificates</strong>: after account deletion, the public certificate
              record (the name printed on the certificate, hours, dates and verification code) is
              kept, with no link to the deleted account, so that issued certificates remain
              verifiable.
            </li>
            <li>
              <strong>Anonymised research data</strong>: may be kept, because it no longer
              identifies anyone (LGPD art. 12 and art. 16, II).
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights and How to Exercise Them</h2>
          <p>Under LGPD art. 18 you have the right to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Confirm whether we process your data and access it.</li>
            <li>Correct incomplete, inaccurate or outdated data.</li>
            <li>Anonymise, block or delete unnecessary or excessive data.</li>
            <li>Data portability.</li>
            <li>Delete data processed with your consent, and withdraw consent at any time.</li>
            <li>Know with whom we share your data and the consequences of refusing consent.</li>
            <li>
              Request a review of decisions taken solely by automated processing (art. 20); see our{' '}
              <a href="/en/responsible-ai" className="text-green-600 hover:underline">
                Responsible AI Policy
              </a>
              .
            </li>
          </ul>
          <h3 className="text-xl font-medium mb-2 mt-4">How to exercise them</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>In the app</strong>: signed in, open Settings, in the Privacy section, and use{' '}
              <em>Export my data</em> (downloads a JSON file with your data) or{' '}
              <em>Delete my account</em> (immediate and irreversible). These actions only ever act
              on the signed-in account.
            </li>
            <li>
              <strong>By email</strong>: write to{' '}
              <a href="mailto:andersonhs27@gmail.com" className="text-green-600 hover:underline">
                andersonhs27@gmail.com
              </a>{' '}
              from the email address of your account. We answer within 15 days (LGPD art. 19).
            </li>
            <li>
              You can also file a complaint with the Brazilian Data Protection Authority (ANPD) at{' '}
              <a href="https://www.gov.br/anpd" className="text-green-600 hover:underline">
                gov.br/anpd
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Data Protection</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your
            information, including:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Data encryption in transit (HTTPS)</li>
            <li>Row-level access rules in the database that limit what each account can read</li>
            <li>Continuous security monitoring</li>
            <li>Data anonymization whenever possible</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Children and Adolescents</h2>
          <p>
            We follow the Statute of Children and Adolescents (ECA, Lei 8.069/1990) and LGPD art.
            14: data of children and adolescents is processed only in their best interest.
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>The transparency chat and investigations are not directed at children under 12.</li>
            <li>
              Children use the platform only through <strong>Ágora Kids</strong>, inside a parent or
              guardian account, after the parent gives specific and highlighted consent (art. 14,
              §1). We collect the minimum needed (first name or nickname and activity), with no
              advertising and no profiling.
            </li>
            <li>
              The kids agents filter blocked topics and answer in age-appropriate language. Parents
              can follow the activity, export the data and delete it at any time.
            </li>
            <li>
              Adolescents (12 to 17) should use the platform with the knowledge of their parents or
              guardians.
            </li>
            <li>
              If we learn that a child&apos;s data was collected without parental consent, we delete
              it. Report it to{' '}
              <a href="mailto:andersonhs27@gmail.com" className="text-green-600 hover:underline">
                andersonhs27@gmail.com
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Artificial Intelligence</h2>
          <p>
            Your chat messages are processed by AI agents and by the LLM provider listed in section
            4. AI findings are signals to verify, not accusations, and are not used to take
            decisions about you. Read the{' '}
            <a href="/en/responsible-ai" className="text-green-600 hover:underline">
              Responsible AI and Content Policy
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Cookies</h2>
          <p>
            We use essential cookies for site functionality. For more details, see our{' '}
            <a href="/en/cookies" className="text-green-600 hover:underline">
              Cookie Policy
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Use for Scientific Research</h2>
          <p className="mb-4">
            Cidadão.AI is part of an academic research project on usability of public transparency
            systems. With your <strong>explicit consent</strong>, we may collect and use anonymized
            interaction data (clicks, navigation, response time, feedback) for usability and
            accessibility studies and scientific publications.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Anonymization:</strong> personal data is removed or transformed into
              cryptographic hashes (SHA-256)
            </li>
            <li>
              <strong>Aggregation:</strong> results are published only in aggregated form, never
              individual
            </li>
            <li>
              <strong>Revocable consent:</strong> you can accept or decline through the research
              banner, and withdraw at any time without losing access to any feature
            </li>
            <li>
              <strong>No commercialization:</strong> research data is never sold or shared
              commercially
            </li>
          </ul>
          <p>
            Legal basis: <strong>LGPD art. 7, IV</strong>, studies by a research body, ensuring
            anonymization whenever possible.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Policy Changes</h2>
          <p>
            We may update this policy periodically. The date at the top shows the latest version,
            and significant changes will be announced on the website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Contact</h2>
          <p>
            For any privacy question or request, contact the data controller, Anderson Henrique da
            Silva, at{' '}
            <a href="mailto:andersonhs27@gmail.com" className="text-green-600 hover:underline">
              andersonhs27@gmail.com
            </a>
            , or open an issue on{' '}
            <a
              href="https://github.com/anderson-ntlabs/cidadao.ai-frontend/issues"
              className="text-green-600 hover:underline"
            >
              GitHub
            </a>{' '}
            (do not include personal data in public issues). See also our{' '}
            <a href="/en/terms" className="text-green-600 hover:underline">
              Terms of Use
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
