import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | BiteReserve',
  description: 'BiteReserve Privacy Policy - How we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="text-accent-600 font-bold text-lg hover:text-accent-700 transition-colors">
            ← Back to BiteReserve
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-8">
              At BiteReserve, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information that you provide directly to us and information that is automatically collected when you use our services:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Information You Provide:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li><strong>Account Information:</strong> Email address, full name, and password when you create an account</li>
                <li><strong>Restaurant Information:</strong> Restaurant name, address, phone number, website, cuisine type, booking platform, and any other information you provide when claiming or managing your restaurant listing</li>
                <li><strong>Payment Information:</strong> When you purchase subscriptions, payment information is processed by Stripe. We do not store your full payment card details on our servers.</li>
                <li><strong>Campaign Data:</strong> Information about tracking links you create, campaigns you manage, and subscription details</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Automatically Collected Information:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li><strong>Analytics Data:</strong> Page views, clicks (phone, address, website, hours), reservation requests, and how visitors interact with your restaurant page</li>
                <li><strong>Tracking Information:</strong> Source of traffic, campaign attribution, referrer URLs, and device information (browser type, device type, IP address, operating system)</li>
                <li><strong>Usage Data:</strong> How you interact with our dashboard, features used, and time spent on the platform</li>
                <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to track visitor behavior and improve our services</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your account registration and manage your restaurant listing</li>
                <li>Process payments for subscriptions</li>
                <li>Track and display analytics data in your dashboard (page views, clicks, reservation requests, traffic sources)</li>
                <li>Generate tracking links and attribute traffic to specific campaigns or sources</li>
                <li>Send you service-related communications (account updates, subscription information, analytics reports)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations and enforce our Terms of Service</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Share Your Information</h2>
              <p className="text-gray-700 mb-4">We may share your information in the following circumstances:</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Service Providers:</h3>
              <p className="text-gray-700 mb-4">We use third-party services to operate our platform:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li><strong>Supabase:</strong> For database storage and authentication (see <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:underline">Supabase's Privacy Policy</a>)</li>
                <li><strong>Stripe:</strong> For payment processing (see <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:underline">Stripe's Privacy Policy</a>)</li>
                <li><strong>Vercel:</strong> For hosting and platform infrastructure (see <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:underline">Vercel's Privacy Policy</a>)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Public Information:</h3>
              <p className="text-gray-700 mb-4">
                Your restaurant name, address, phone number, website, and other information you provide will be displayed publicly on your BiteReserve restaurant page. This page is designed to help potential diners find and contact your restaurant.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Legal Requirements:</h3>
              <p className="text-gray-700 mb-4">
                We may disclose information if required by law or to protect our rights and safety, or that of our users.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Business Transfers:</h3>
              <p className="text-gray-700 mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>
              <p className="text-gray-700 mb-4">
                Your data is stored securely using Supabase, a cloud database service. We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>IP address hashing for visitor analytics to protect privacy</li>
              </ul>
              <p className="text-gray-700">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct your account and restaurant information through your profile settings</li>
                <li><strong>Deletion:</strong> Request deletion of your account by emailing matthijs@2xgen.com with "Delete Account Request" in the subject line (see our Terms of Service for details)</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-Out:</strong> You can opt out of certain data collection through your browser settings or cookie preferences</li>
              </ul>
              <p className="text-gray-700">To exercise these rights, please contact us at matthijs@2xgen.com.</p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. Analytics data is retained according to your subscription plan:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li><strong>Free Plan:</strong> 14 days of analytics history</li>
                <li><strong>Pro Plan:</strong> 90 days of analytics history</li>
                <li><strong>Business Plan:</strong> 365 days of analytics history</li>
              </ul>
              <p className="text-gray-700">
                When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or legitimate business purposes. Note that some anonymized analytics data may be retained for platform improvement purposes.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
              <p className="text-gray-700">
                BiteReserve is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately at matthijs@2xgen.com.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our services, you consent to the transfer of your information to these countries. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. California Privacy Rights (CCPA)</h2>
              <p className="text-gray-700 mb-4">If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Right to know what personal information we collect, use, and disclose</li>
                <li>Right to delete personal information (subject to certain exceptions)</li>
                <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising your privacy rights</li>
              </ul>
              <p className="text-gray-700">To exercise your California privacy rights, please contact us at matthijs@2xgen.com.</p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. European Privacy Rights (GDPR)</h2>
              <p className="text-gray-700 mb-4">If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent (where processing is based on consent)</li>
              </ul>
              <p className="text-gray-700">To exercise your GDPR rights, please contact us at matthijs@2xgen.com.</p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-900 font-semibold mb-2">Email:</p>
                <a href="mailto:matthijs@2xgen.com" className="text-accent-600 hover:underline">matthijs@2xgen.com</a>
                <p className="text-gray-900 font-semibold mt-4 mb-2">Company:</p>
                <p className="text-gray-700">2xGen LLC</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
