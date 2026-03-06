// app/(public)/terms/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Applied Agentic AI. Read our terms before using the site.',
  openGraph: {
    title: 'Terms of Service | Applied Agentic AI',
    description: 'Terms of Service for Applied Agentic AI.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | Applied Agentic AI',
    description: 'Terms of Service for Applied Agentic AI.',
  },
}

export default function TermsPage() {
  const lastUpdated = 'March 1, 2025'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: 'rgba(108,61,255,0.12)', color: '#A78BFA' }}>
          Legal
        </div>
        <h1 className="text-4xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
          Terms of Service
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* AI Content Disclaimer Banner */}
      <div className="rounded-2xl p-5 mb-10 border"
        style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.25)' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🤖</span>
          <div>
            <p className="font-semibold mb-1" style={{ color: '#FCD34D' }}>AI-Generated Content Disclosure</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              A significant portion of the articles, images, and other content on Applied Agentic AI is generated
              or assisted by artificial intelligence (AI) tools including large language models (LLMs) and
              AI image generation systems. While we strive for accuracy, AI-generated content may contain
              errors, inaccuracies, or outdated information. <strong style={{ color: 'var(--text-primary)' }}>
              Always verify important information with authoritative sources.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>

        {/* 1. Acceptance */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            1. Acceptance of Terms
          </h2>
          <p className="mb-3">
            By accessing or using <strong style={{ color: 'var(--text-primary)' }}>Applied Agentic AI</strong> (&ldquo;the Site&rdquo;,
            &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;), located at <a href="https://appliedagentic.in"
            className="underline" style={{ color: '#A78BFA' }}>appliedagentic.in</a>, you agree to be bound
            by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not
            use the Site.
          </p>
          <p>
            These Terms apply to all visitors, users, and others who access or use the Site. Your continued
            use of the Site constitutes your acceptance of any modifications to these Terms.
          </p>
        </section>

        {/* 2. Description of Service */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            2. Description of Service
          </h2>
          <p className="mb-3">
            Applied Agentic AI is an educational platform providing articles, guides, and resources about
            artificial intelligence, agentic systems, large language models (LLMs), and related technologies.
            Content is intended for informational and educational purposes only.
          </p>
          <p>
            The Site may display advertisements served by third-party ad networks, including Google AdSense,
            as a means of supporting the platform financially. Revenue from advertising helps us maintain
            and improve the quality of our content.
          </p>
        </section>

        {/* 3. AI-Generated Content */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            3. AI-Generated Content
          </h2>
          <p className="mb-3">
            We use artificial intelligence tools to assist in creating, editing, and enhancing content on
            this Site. This includes but is not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-3 pl-2">
            <li><strong style={{ color: 'var(--text-primary)' }}>Articles and written content</strong> — generated or assisted by AI language models</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Images and illustrations</strong> — generated by AI image creation tools</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Summaries and metadata</strong> — automatically generated by AI systems</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Audio narrations</strong> — synthesized using text-to-speech AI</li>
          </ul>
          <p className="mb-3">
            AI-generated content is clearly identified where possible. However, you should be aware that:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>AI content may contain factual errors, hallucinations, or inaccuracies</li>
            <li>AI-generated images may not accurately represent real events, people, or objects</li>
            <li>Technical details about rapidly evolving AI topics may become outdated quickly</li>
            <li>Content should not be used as the sole basis for important decisions</li>
          </ul>
        </section>

        {/* 4. Intellectual Property */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            4. Intellectual Property
          </h2>
          <p className="mb-3">
            The Site and its original content (excluding AI-generated content where third-party rights may
            apply), features, and functionality are owned by Applied Agentic AI and are protected by
            international copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            You may not reproduce, distribute, modify, create derivative works of, publicly display,
            publicly perform, republish, download, store, or transmit any of the material on our Site
            without prior written consent, except for personal, non-commercial use.
          </p>
        </section>

        {/* 5. Advertising & Revenue Monetization */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            5. Advertising &amp; Revenue Monetization
          </h2>
          <p className="mb-3">
            This Site participates in advertising programs to generate revenue that supports its operation.
            These include:
          </p>
          <div className="space-y-4">
            <div className="rounded-xl p-4 border" style={{ borderColor: 'var(--bg-border)', background: 'var(--bg-elevated)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Google AdSense</p>
              <p>
                We use Google AdSense to display advertisements. Google may use cookies and web beacons
                to collect data about your browsing activity to serve personalized ads. Google&apos;s use
                of advertising cookies enables it and its partners to serve ads to you based on your visit
                to our site and/or other sites on the Internet. You may opt out of personalized advertising
                by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: '#A78BFA' }}>Google Ads Settings</a>.
                Google&apos;s advertising practices are governed by the{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: '#A78BFA' }}>Google Privacy Policy</a>.
              </p>
            </div>
            <div className="rounded-xl p-4 border" style={{ borderColor: 'var(--bg-border)', background: 'var(--bg-elevated)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Other Ad Networks</p>
              <p>
                We may work with other advertising partners from time to time. These third-party ad networks
                may use cookies, JavaScript, or web beacons in their advertisements and links that appear
                on our Site, which are sent directly to your browser. They automatically receive your IP
                address when this occurs. These technologies are used to measure the effectiveness of
                advertising campaigns and/or to personalize advertising content.
              </p>
            </div>
          </div>
          <p className="mt-3">
            By using this Site, you consent to the display of advertisements and acknowledge that we may
            earn revenue from such advertising. Advertisements do not influence our editorial content.
          </p>
        </section>

        {/* 6. Third-Party Platforms */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            6. Third-Party Platforms &amp; Social Media
          </h2>
          <p className="mb-3">
            This Site may contain links to or integrations with third-party platforms. Our use of these
            platforms is subject to their respective terms of service:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Google</strong> — Content may be indexed by Google Search.
              We comply with <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer"
              className="underline" style={{ color: '#A78BFA' }}>Google&apos;s Terms of Service</a>.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Meta (Facebook/Instagram)</strong> — We may integrate
              Meta social sharing features. Use is subject to{' '}
              <a href="https://www.facebook.com/terms" target="_blank" rel="noopener noreferrer"
              className="underline" style={{ color: '#A78BFA' }}>Meta&apos;s Terms of Service</a>.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>X (Twitter)</strong> — We may share or embed content
              from X. Use is subject to{' '}
              <a href="https://twitter.com/tos" target="_blank" rel="noopener noreferrer"
              className="underline" style={{ color: '#A78BFA' }}>X&apos;s Terms of Service</a>.
            </li>
          </ul>
          <p className="mt-3">
            We are not responsible for the content or practices of third-party websites or platforms. We
            encourage you to review the terms and privacy policies of any third-party sites you visit.
          </p>
        </section>

        {/* 7. Disclaimer of Warranties */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            7. Disclaimer of Warranties
          </h2>
          <p className="mb-3">
            THE SITE AND ITS CONTENT ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT
            ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES
            OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>
          <p>
            We do not warrant that the Site will be uninterrupted or error-free, that defects will be
            corrected, or that the Site or the server that makes it available is free of viruses or other
            harmful components. We make no guarantees about the accuracy, completeness, or usefulness of
            any content, especially AI-generated content.
          </p>
        </section>

        {/* 8. Limitation of Liability */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            8. Limitation of Liability
          </h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, APPLIED AGENTIC AI SHALL NOT BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
            LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM
            YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SITE OR ITS CONTENT.
          </p>
        </section>

        {/* 9. User Conduct */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            9. User Conduct
          </h2>
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Use the Site for any unlawful purpose or in violation of any regulations</li>
            <li>Scrape, crawl, or spider the Site in a manner that places unreasonable load on our servers</li>
            <li>Attempt to gain unauthorized access to any portion of the Site</li>
            <li>Use the Site to transmit spam, malware, or other harmful content</li>
            <li>Reproduce or redistribute content without permission</li>
          </ul>
        </section>

        {/* 10. Privacy */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            10. Privacy
          </h2>
          <p>
            Your use of the Site is also governed by our{' '}
            <Link href="/privacy" className="underline" style={{ color: '#A78BFA' }}>Privacy Policy</Link>,
            which is incorporated into these Terms by reference. Please review our Privacy Policy to
            understand our practices.
          </p>
        </section>

        {/* 11. Changes to Terms */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            11. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of significant
            changes by updating the &ldquo;Last updated&rdquo; date at the top of this page. Your continued use of
            the Site after any changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        {/* 12. Governing Law */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            12. Governing Law
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable law. Any disputes
            arising under or in connection with these Terms shall be subject to the exclusive jurisdiction
            of the competent courts.
          </p>
        </section>

        {/* 13. Contact */}
        <section>
          <h2 className="text-xl font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
            13. Contact Us
          </h2>
          <p>
            If you have any questions about these Terms of Service, please contact us through our website
            at <a href="https://appliedagentic.in" className="underline" style={{ color: '#A78BFA' }}>appliedagentic.in</a>.
          </p>
        </section>

        {/* Footer nav */}
        <div className="pt-6 flex items-center gap-4 border-t" style={{ borderColor: 'var(--bg-border)' }}>
          <Link href="/privacy" className="text-sm underline" style={{ color: '#A78BFA' }}>Privacy Policy</Link>
          <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
