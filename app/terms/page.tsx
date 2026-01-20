import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions | BiteReserve',
  description: 'BiteReserve Terms and Conditions - Terms of Service for using our restaurant tracking platform.',
  openGraph: {
    title: 'Terms and Conditions | BiteReserve',
    description: 'BiteReserve Terms and Conditions - Terms of Service for using our restaurant tracking platform.',
    type: 'website',
    images: [
      {
        url: 'https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png',
        width: 1200,
        height: 630,
        alt: 'BiteReserve',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms and Conditions | BiteReserve',
    description: 'BiteReserve Terms and Conditions - Terms of Service for using our restaurant tracking platform.',
    images: ['https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png'],
  },
}

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using BiteReserve, you accept and agree to these Terms of Service. You also acknowledge that you have read our <Link href="/privacy" className="text-accent-600 hover:underline">Privacy Policy</Link>. The Privacy Policy explains how we collect, use, and protect your information.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700">
                BiteReserve is a restaurant tracking and analytics platform that provides restaurant owners with a dedicated landing page, campaign attribution tracking, and real-time analytics to understand where their guests come from. Our platform tracks page views, clicks (phone, address, website, hours), reservation requests, and traffic sources, helping restaurants measure demand and optimize their marketing efforts.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Creation and Restaurant Information</h2>
              <p className="text-gray-700 mb-4">
                When creating an account on BiteReserve, you agree to provide accurate, current, and complete information about yourself and your restaurant. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Restaurant Information:</strong> You represent that you are the owner, manager, or authorized representative of the restaurant you are claiming or managing. You agree to provide accurate information about your restaurant, including name, address, phone number, website, cuisine type, and hours of operation. BiteReserve reserves the right to request verification and to terminate accounts for restaurants that cannot be verified or that violate our terms.
              </p>
              <p className="text-gray-700">
                <strong>Account Security:</strong> You are responsible for maintaining the security of your account credentials. You agree to notify us immediately of any unauthorized access or use of your account.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Use our services in compliance with all applicable laws and regulations</li>
                <li>Provide accurate and truthful information about your restaurant</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Not use the platform for any illegal or unauthorized purpose</li>
                <li>Not interfere with or disrupt the platform or servers</li>
                <li>Not attempt to gain unauthorized access to any part of the platform</li>
                <li>Not create false or misleading campaign links or analytics data</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscriptions and Premium Services</h2>
              <p className="text-gray-700 mb-4">
                BiteReserve offers subscription plans (Free, Pro, Business) that provide different levels of access to analytics, tracking links, and platform features. All subscriptions are sold "as is" and are:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Non-refundable:</h3>
              <p className="text-gray-700 mb-4">
                All subscription purchases are final. We do not offer refunds for any reason, including but not limited to subscription cancellations, unused subscription periods, or account termination. If you cancel your subscription, it will remain active until the end of your current billing period, and you will retain access to all features until that time.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Non-transferable:</h3>
              <p className="text-gray-700 mb-4">
                Subscriptions are tied to your account and specific restaurant listing(s). They cannot be transferred, sold, or assigned to another user, account, or restaurant.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">No Guarantee of Results:</h3>
              <p className="text-gray-700 mb-4">
                While BiteReserve provides analytics and tracking tools to help you understand where your guests come from, we do not guarantee that using our platform will result in increased bookings, revenue, or restaurant traffic. The platform is designed to provide insights and attribution data, but we cannot control or guarantee the behavior of your potential guests or the effectiveness of your marketing efforts.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Subscription Features:</h3>
              <p className="text-gray-700 mb-4">
                Subscription features, analytics retention periods, and limits (such as campaign links or actions per month) are subject to change. We will provide reasonable notice of any material changes to subscription features or pricing. Features available on different plans are described on our pricing page and may be updated from time to time.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Free Trial:</h3>
              <p className="text-gray-700 mb-4">
                If you sign up for a Pro plan free trial, the trial will automatically convert to a paid subscription at the end of the trial period unless you cancel before the trial ends. You authorize us to charge your payment method at the end of the trial period. Cancellation during the trial period will result in immediate access to Free plan features and limits.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Analytics Data and Tracking</h2>
              <p className="text-gray-700 mb-4">
                BiteReserve tracks and displays analytics data related to your restaurant page, including page views, clicks, reservation requests, and traffic sources. This data is collected automatically when visitors interact with your BiteReserve page.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Data Accuracy:</strong> While we strive to provide accurate analytics data, we cannot guarantee absolute accuracy. Analytics data is provided for informational purposes only and should not be the sole basis for business decisions.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Data Retention:</strong> Analytics data retention varies by subscription plan (14 days for Free, 90 days for Pro, 365 days for Business). Data beyond your plan's retention period may be permanently deleted.
              </p>
              <p className="text-gray-700">
                <strong>Privacy:</strong> Analytics data includes information about visitor interactions. We hash IP addresses and take measures to protect visitor privacy while still providing useful attribution data. Please see our <Link href="/privacy" className="text-accent-600 hover:underline">Privacy Policy</Link> for more information.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Campaign Links and Attribution</h2>
              <p className="text-gray-700 mb-4">
                BiteReserve allows you to create tracking links for different marketing channels (hotels, influencers, social media, QR codes, etc.). These links help you attribute traffic and bookings to specific sources.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Link Creation:</strong> You are responsible for creating appropriate campaign links and using them in accordance with these terms. You agree not to create misleading, deceptive, or inappropriate campaign names or links.
              </p>
              <p className="text-gray-700">
                <strong>Attribution:</strong> While BiteReserve tracks when visitors arrive through campaign links, we cannot guarantee perfect attribution. Factors such as direct navigation, browser settings, and privacy tools may affect tracking accuracy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Reservation Requests and Booking Systems</h2>
              <p className="text-gray-700 mb-4">
                BiteReserve provides a reservation request form and integrates with various booking platforms (OpenTable, Resy, WhatsApp, email, etc.). However, BiteReserve is not a booking platform itself and does not process reservations directly.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Third-Party Integrations:</strong> When you configure integrations with booking platforms or contact methods, you are responsible for maintaining those integrations and ensuring they function correctly. BiteReserve is not responsible for the availability, functionality, or terms of third-party booking platforms.
              </p>
              <p className="text-gray-700">
                <strong>Reservation Requests:</strong> Reservation requests submitted through BiteReserve are tracked and displayed in your analytics dashboard. However, BiteReserve is not responsible for processing, confirming, or managing these requests. You are responsible for following up on reservation requests through your chosen booking system.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Account Deletion</h2>
              <p className="text-gray-700 mb-4">
                If you wish to delete your account, please send an email to matthijs@2xgen.com with the subject line "Delete Account Request". In your email, please include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Your account email address</li>
                <li>Your restaurant name(s)</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Upon receipt of a valid deletion request, we will process the deletion of your account and associated data in accordance with our <Link href="/privacy" className="text-accent-600 hover:underline">Privacy Policy</Link>. Please note that account deletion is permanent and cannot be undone.
              </p>
              <p className="text-gray-700">
                <strong>Forfeiture:</strong> Any active subscriptions will be forfeited upon account deletion, and no refunds will be provided, as stated in Section 5.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on BiteReserve, including text, graphics, logos, software, and platform design, is the property of BiteReserve, 2xGen LLC, or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700">
                You retain ownership of any content you provide to BiteReserve (such as restaurant information, descriptions, and images). By providing content, you grant BiteReserve a license to use, display, and distribute that content on your restaurant page and within the platform.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                BiteReserve shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. This includes, but is not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Loss of revenue, profits, or business opportunities</li>
                <li>Loss of data or analytics information</li>
                <li>Failure of tracking links or analytics to function correctly</li>
                <li>Issues with third-party booking platform integrations</li>
                <li>Any losses related to subscription purchases or the failure of the platform to result in increased bookings or revenue</li>
              </ul>
              <p className="text-gray-700">
                Our total liability to you for any claims related to the service shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                The information provided on BiteReserve is for general informational purposes only. We do not guarantee:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>The accuracy, completeness, or usefulness of any analytics data or insights</li>
                <li>That using BiteReserve will result in increased bookings, reservations, or revenue</li>
                <li>That tracking links will accurately attribute all traffic</li>
                <li>The availability, functionality, or uptime of the platform</li>
                <li>That the platform will be free from errors, bugs, or security vulnerabilities</li>
              </ul>
              <p className="text-gray-700">
                The platform is provided "as is" and "as available" without warranties of any kind, either express or implied.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page. We will update the "Last updated" date at the top of this page when changes are made. Your continued use of the service after changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Trademarks</h2>
              <p className="text-gray-700">
                BiteReserve, including its name, branding, logos, and all associated marks, is a trademark of 2xGen LLC. All rights are reserved. You may not use, reproduce, imitate, or distribute any trademarked material without prior written authorization from 2xGen LLC. Unauthorized use may violate applicable trademark, copyright, and unfair-competition laws.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Governing Law</h2>
              <p className="text-gray-700">
                These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which BiteReserve operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-900 font-semibold mb-2">Email:</p>
                <a href="mailto:matthijs@2xgen.com" className="text-accent-600 hover:underline">matthijs@2xgen.com</a>
                <p className="text-gray-900 font-semibold mt-4 mb-2">Company:</p>
                <p className="text-gray-700">2xGen LLC</p>
              </div>
            </section>

            <section className="mb-10 bg-accent-50 rounded-xl p-6 border border-accent-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Our Terms?</h2>
              <p className="text-gray-700">
                If you have any questions about our Terms of Service or need clarification on any section, we're here to help. Please contact us at <a href="mailto:matthijs@2xgen.com" className="text-accent-600 hover:underline font-semibold">matthijs@2xgen.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
