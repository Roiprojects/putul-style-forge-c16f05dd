import BackButton from "@/components/BackButton";

const PrivacyPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-3xl">
      <BackButton />
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground mb-10">Last updated: 26 March 2026</p>

      <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
          <p>Putul Fashions ("we", "our", "us") operates the website putulfashions.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase. By using our services, you consent to the data practices described in this policy.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
          <p className="mb-2"><strong>Personal Information:</strong> When you place an order, create an account, or contact us, we may collect your name, email address, phone number, shipping address, billing address, and payment information.</p>
          <p className="mb-2"><strong>Automatically Collected Information:</strong> We automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, access times, and pages viewed.</p>
          <p><strong>Cookies:</strong> We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To process and fulfill your orders, including shipping and delivery</li>
            <li>To communicate with you about orders, products, services, and promotions</li>
            <li>To provide customer support and respond to inquiries</li>
            <li>To improve our website, products, and services</li>
            <li>To detect and prevent fraud or unauthorized transactions</li>
            <li>To comply with legal obligations and enforce our terms</li>
            <li>To send promotional communications (with your consent, which you may withdraw at any time)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. Payment Information</h2>
          <p>All payment transactions are processed through Razorpay, a PCI-DSS compliant payment gateway. We do not store your credit/debit card details or banking credentials on our servers. Your payment information is encrypted and handled securely by Razorpay in accordance with their privacy policy and security standards.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Information Sharing</h2>
          <p className="mb-2">We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Service Providers:</strong> Shipping companies, payment processors (Razorpay), and analytics providers who assist in our operations</li>
            <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Security</h2>
          <p>We implement industry-standard security measures including SSL encryption, secure server infrastructure, and access controls to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Access, correct, or delete your personal information</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of the data we hold about you</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <strong>support@putulfashions.com</strong>.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">8. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce agreements. Order data is retained for a minimum of 8 years as per Indian tax regulations.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">9. Children's Privacy</h2>
          <p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with a revised "Last updated" date.</p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact us at:</p>
          <div className="mt-3 space-y-1 text-foreground/70">
            <p><strong>Putul Fashions</strong></p>
            <p>Email: support@putulfashions.com</p>
            <p>Phone: +91 80006 85588</p>
            <p>India</p>
          </div>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage;
