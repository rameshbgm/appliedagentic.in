// app/(public)/privacy/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Applied Agentic AI. Learn how we collect, use, and protect your data.',
  openGraph: {
    title: 'Privacy Policy | Applied Agentic AI',
    description: 'Privacy Policy for Applied Agentic AI. Learn how we collect, use, and protect your data.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Applied Agentic AI',
    description: 'Privacy Policy for Applied Agentic AI. Learn how we collect, use, and protect your data.',
  },
}

export default function PrivacyPage() {
  const lastUpdated = 'March 1, 2025'

  return (
    <div>
      <header className="a-wrap a-opener" style={{ maxWidth: 780 }}>
        <nav className="a-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Legal</span>
        </nav>
        <h1 className="a-display">Privacy Policy</h1>
        <div className="a-opener__stats"><span className="a-tag">Last updated {lastUpdated}</span></div>
      </header>

      <div className="a-wrap a-legal">
        <div className="notice" role="note">
          <p className="a-kicker" style={{ color: 'var(--ink)' }}>AI-Generated Content Notice</p>
          <p>
            This Privacy Policy, as well as much of the content on Applied Agentic AI, was created with
              assistance from artificial intelligence tools. While we have reviewed and edited this policy
              for accuracy, please contact us directly if you have specific privacy concerns or questions.
          </p>
        </div>


        {/* Introduction */}
        <section>
          <h2>
            1. Introduction
          </h2>
          <p className="mb-3">
            <strong>Applied Agentic AI</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;,
            &ldquo;us&rdquo;) operates the website at{' '}
            <a href="https://appliedagentic.in" className="underline">
              appliedagentic.in
            </a>{' '}
            (the &ldquo;Site&rdquo;). This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you visit our Site.
          </p>
          <p>
            We respect your privacy and are committed to protecting your personal information. Please read
            this policy carefully. If you do not agree with its terms, please discontinue use of the Site.
          </p>
        </section>

        {/* Information We Collect */}
        <section>
          <h2>
            2. Information We Collect
          </h2>

          <h3>2.1 Automatically Collected Information</h3>
          <p className="mb-3">
            When you visit our Site, we automatically collect certain information about your device and
            browsing activity, including:
          </p>
          <ul className="space-y-2 mb-4 pl-2">
            <li>IP address and approximate geographic location</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited, time spent, and navigation patterns</li>
            <li>Referring website or search query</li>
            <li>Device type (desktop, mobile, tablet)</li>
          </ul>

          <h3>2.2 Information You Provide</h3>
          <p className="mb-3">
            You may choose to provide information directly to us, such as:
          </p>
          <ul className="space-y-2 pl-2">
            <li>Email address when subscribing to our newsletter</li>
            <li>Name and contact information when reaching out via contact forms</li>
            <li>Comments or feedback you submit</li>
          </ul>
        </section>

        {/* Cookies */}
        <section>
          <h2>
            3. Cookies &amp; Tracking Technologies
          </h2>
          <p className="mb-3">
            We use cookies, web beacons, pixels, and similar tracking technologies to collect and store
            information about your interactions with our Site. These include:
          </p>
          <div className="space-y-3 mb-4">
            <div className="box">
              <p className="font-semibold mb-1">Essential Cookies</p>
              <p>Required for the Site to function correctly. These cannot be disabled.</p>
            </div>
            <div className="box">
              <p className="font-semibold mb-1">Analytics Cookies</p>
              <p>
                Help us understand how visitors interact with our Site, which pages are most popular,
                and how users navigate our content. We may use Google Analytics or similar tools for
                this purpose.
              </p>
            </div>
            <div className="box">
              <p className="font-semibold mb-1">Advertising Cookies</p>
              <p>
                Used by our advertising partners (including Google AdSense) to display relevant
                advertisements and measure advertising effectiveness. These may track your browsing
                activity across different websites.
              </p>
            </div>
          </div>
          <p>
            Most browsers allow you to control cookies through their settings. However, disabling certain
            cookies may affect the functionality of our Site.
          </p>
        </section>

        {/* How We Use Information */}
        <section>
          <h2>
            4. How We Use Your Information
          </h2>
          <p className="mb-3">We use the information we collect to:</p>
          <ul className="space-y-2 pl-2">
            <li>Operate, maintain, and improve our Site</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Send newsletters and updates to subscribers (only with your consent)</li>
            <li>Display personalized or contextual advertisements</li>
            <li>Respond to inquiries and support requests</li>
            <li>Comply with legal obligations</li>
            <li>Detect and prevent fraudulent or abusive activity</li>
          </ul>
        </section>

        {/* Third-Party Services */}
        <section>
          <h2>
            5. Third-Party Services &amp; Advertising Networks
          </h2>
          <p className="mb-4">
            We work with third-party service providers who may collect and process data about your use
            of our Site. These third parties have their own privacy policies governing their data practices.
          </p>

          <div className="space-y-4">
            {/* Google */}
            <div className="box">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔵</span>
                <p className="font-semibold">Google (AdSense &amp; Analytics)</p>
              </div>
              <p className="mb-2">
                We use Google AdSense to serve advertisements. Google and its partners use cookies to
                serve ads based on a user&apos;s prior visits to our website and other websites on the
                Internet. Google&apos;s use of advertising cookies enables it and its partners to serve ads
                to users based on their visit to our Site and/or other sites on the Internet.
              </p>
              <p className="mb-2">
                We may also use Google Analytics to understand site usage and user behavior.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs underline">
                  Google Privacy Policy ↗
                </a>
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs underline">
                  Opt out of personalized ads ↗
                </a>
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs underline">
                  Opt out of Google Analytics ↗
                </a>
              </div>
            </div>

            {/* Meta */}
            <div className="box">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔷</span>
                <p className="font-semibold">Meta (Facebook &amp; Instagram)</p>
              </div>
              <p className="mb-2">
                Our Site may include Meta social plugins or sharing buttons. When you interact with these
                features, Meta may collect information about your visit. If you are logged into Facebook
                or Instagram, Meta may associate this information with your account.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs underline">
                  Meta Privacy Policy ↗
                </a>
              </div>
            </div>

            {/* X (Twitter) */}
            <div className="box">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">𝕏</span>
                <p className="font-semibold">X (formerly Twitter)</p>
              </div>
              <p className="mb-2">
                Our Site may include X/Twitter sharing buttons or embedded tweets. Interaction with these
                features may allow X to collect information about your visit and associate it with your
                X account if you are logged in.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://twitter.com/privacy" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs underline">
                  X Privacy Policy ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* AI Content & Data */}
        <section>
          <h2>
            6. Artificial Intelligence &amp; Content Generation
          </h2>
          <p className="mb-3">
            We use AI services to generate content for this Site. When generating content, we may submit
            prompts and context to AI service providers. We do not submit personally identifiable
            information about our users to AI systems.
          </p>
          <p className="mb-3">
            <strong>AI-Generated Images:</strong> Images on this Site
            may be generated by AI tools. These images are created from text prompts and do not represent
            real people, places, or events unless otherwise stated.
          </p>
          <p>
            <strong>AI Content Accuracy:</strong> AI-generated content
            may contain errors or inaccuracies. We recommend independently verifying any information
            before relying on it for important decisions.
          </p>
        </section>

        {/* Data Security */}
        <section>
          <h2>
            7. Data Security
          </h2>
          <p>
            We implement reasonable technical and organizational measures to protect your information
            against unauthorized access, alteration, disclosure, or destruction. However, no method of
            transmission over the Internet or electronic storage is 100% secure. We cannot guarantee
            absolute security of your data.
          </p>
        </section>

        {/* Data Retention */}
        <section>
          <h2>
            8. Data Retention
          </h2>
          <p>
            We retain automatically collected data (such as server logs and analytics data) for a period
            sufficient to fulfill the purposes outlined in this policy, typically no longer than 24 months.
            Email addresses for newsletter subscribers are retained until you unsubscribe. You may request
            deletion of your data by contacting us.
          </p>
        </section>

        {/* Your Rights */}
        <section>
          <h2>
            9. Your Rights &amp; Choices
          </h2>
          <p className="mb-3">Depending on your location, you may have the following rights:</p>
          <ul className="space-y-2 pl-2">
            <li><strong>Access</strong> — Request a copy of the personal data we hold about you</li>
            <li><strong>Rectification</strong> — Request correction of inaccurate data</li>
            <li><strong>Erasure</strong> — Request deletion of your personal data</li>
            <li><strong>Opt-out of personalized ads</strong> — Use platform-specific opt-out tools</li>
            <li><strong>Newsletter unsubscribe</strong> — Click the unsubscribe link in any email</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, please contact us at the address provided below.
          </p>
        </section>

        {/* Children */}
        <section>
          <h2>
            10. Children&apos;s Privacy
          </h2>
          <p>
            Our Site is not directed to children under 13 years of age. We do not knowingly collect
            personal information from children under 13. If you believe we have inadvertently collected
            information from a child under 13, please contact us and we will take steps to delete such
            information.
          </p>
        </section>

        {/* GDPR/CCPA */}
        <section>
          <h2>
            11. International Users &amp; Compliance
          </h2>
          <p className="mb-3">
            Our Site is operated from India and is intended for a global audience. If you are accessing
            our Site from the European Economic Area (EEA), United Kingdom, California, or other regions
            with data protection regulations, please be aware:
          </p>
          <ul className="space-y-2 pl-2">
            <li>
              <strong>GDPR (EU/EEA users):</strong> We process data based on legitimate
              interests for analytics and advertising, and on consent for newsletter subscriptions.
            </li>
            <li>
              <strong>CCPA (California users):</strong> California residents have rights
              to know, delete, and opt-out of sale of personal information. We do not sell personal
              information.
            </li>
          </ul>
        </section>

        {/* Changes */}
        <section>
          <h2>
            12. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes
            by updating the &ldquo;Last updated&rdquo; date at the top of this page. We encourage you to review this
            policy periodically to stay informed about how we are protecting your information.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2>
            13. Contact Us
          </h2>
          <p>
            If you have questions or concerns about this Privacy Policy or our data practices, please
            contact us at{' '}
            <a href="https://appliedagentic.in" className="underline">
              appliedagentic.in
            </a>.
          </p>
        </section>

        {/* Footer nav */}
        <div className="a-ctas" style={{ paddingTop: 24, borderTop: '1px solid var(--line)' }}>
          <Link href="/terms" className="a-btn a-btn--quiet a-btn--sm">Terms of Service</Link>
          <Link href="/" className="a-btn a-btn--accent a-btn--sm">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
