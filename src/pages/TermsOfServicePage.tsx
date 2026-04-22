const TermsOfServicePage = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-3xl">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-xs text-muted-foreground mb-10">Last updated: 22 April 2026</p>

      <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using the Putul Fashions website (putulfashions.com), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. Business Information</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Legal Entity:</strong> Putul Fashions</li>
            <li><strong>Nature of Business:</strong> Online retail of footwear and fashion accessories</li>
            <li><strong>Registered Email:</strong> support@putulfashions.com</li>
            <li><strong>Customer Support Phone:</strong> +91 80006 85588</li>
            <li><strong>Operating Hours:</strong> Monday to Saturday, 10:00 AM – 7:00 PM IST</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. Products & Pricing</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>All product descriptions, images, and specifications are as accurate as possible but may vary slightly from actual products due to display settings</li>
            <li>Prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise</li>
            <li>International customers may see approximate prices in their local currency, but all transactions are processed in INR at checkout</li>
            <li>We reserve the right to modify prices without prior notice. The price at the time of order placement will be honored</li>
            <li>In case of pricing errors, we reserve the right to cancel orders and issue full refunds</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. Orders & Payments</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Placing an order constitutes an offer to purchase. We may accept or decline orders at our discretion</li>
            <li>All online payments are processed securely through Razorpay payment gateway (PCI-DSS compliant)</li>
            <li>We accept UPI, Credit/Debit Cards, Net Banking, and digital wallets</li>
            <li>Cash on Delivery (COD) is available for select locations with an additional <strong>10% convenience surcharge</strong> on the order subtotal</li>
            <li>Customers who initially chose COD may convert their order to Online Payment from the Order History page</li>
            <li>Orders are confirmed only upon successful payment verification (or COD confirmation)</li>
            <li>An order confirmation email/SMS will be sent upon successful placement</li>
            <li>We reserve the right to cancel orders in case of suspected fraud, payment failure, or stock unavailability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Shipping & Delivery</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>We deliver across India through Shiprocket and trusted courier partners</li>
            <li>Estimated delivery timelines are <strong>5–10 business days</strong> depending on location and availability</li>
            <li>Shipping charges are calculated based on delivery location and order value at checkout</li>
            <li>Free shipping is available on orders above the threshold displayed at checkout</li>
            <li>Tracking details (AWB number and courier link) are shared via email/SMS once the order is shipped</li>
            <li>Order status syncs in real-time on your account dashboard</li>
            <li>Risk of loss and title for items pass to you upon delivery to the carrier</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. Returns & Refunds</h2>
          <p className="mb-3"><strong>Return Eligibility:</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Returns are accepted within <strong>7 days</strong> of delivery for unused, unworn products in original packaging</li>
            <li>Items must be in their original condition with all tags and original invoice attached</li>
            <li>Sale or discounted items may have different return policies as specified on the product page</li>
            <li>Innerwear, socks, and personal-use items are non-returnable for hygiene reasons</li>
          </ul>

          <p className="mt-4 mb-3"><strong>How to Initiate a Return:</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Go to <strong>My Orders → Order Details → Request Return</strong>, or email support@putulfashions.com</li>
            <li>Our team will approve the request and arrange a reverse pickup (where serviceable)</li>
            <li>Return request status is tracked in real-time on your dashboard: <em>Requested → Approved → Refunded</em> (or Rejected with reason)</li>
          </ul>

          <p className="mt-4 mb-3"><strong>Refund Calculation:</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Refunds are calculated <strong>proportionally based on the actual net amount paid</strong>, accounting for any coupons or discounts applied</li>
            <li>Shipping charges are <strong>non-refundable</strong> unless the return is due to our error (defective, damaged, or wrong item delivered)</li>
            <li>The 10% COD convenience surcharge is non-refundable once the order has been shipped</li>
          </ul>

          <p className="mt-4 mb-3"><strong>Refund Timelines & Methods:</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Prepaid orders (Razorpay/UPI/Card/Net Banking):</strong> Auto-refunded to the original payment method within <strong>5–7 business days</strong> after we receive and inspect the returned item</li>
            <li><strong>COD orders:</strong> You will be asked to provide bank account or UPI details in the return form. Refund is processed manually within <strong>5–7 business days</strong> after inspection</li>
            <li><strong>Store Credit:</strong> Customers may opt for store credit instead of a bank refund — credited instantly upon approval</li>
            <li>Refund status updates are synced in real-time on your account dashboard</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. Cancellation Policy</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Orders can be cancelled <strong>free of charge before they are shipped</strong> from the Order History page</li>
            <li>Once an order is shipped, it cannot be cancelled but may be returned after delivery as per Section 6</li>
            <li>Cancellation is automatically synced with our courier partner (Shiprocket) to halt fulfillment</li>
            <li><strong>Prepaid cancellations:</strong> Full refund issued to the original payment method within <strong>3–5 business days</strong></li>
            <li><strong>COD cancellations:</strong> No charge, no refund required (since no payment was made)</li>
            <li>We reserve the right to cancel orders due to stock unavailability, pricing errors, or suspected fraud — full refund will be issued in such cases</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">8. User Accounts</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>You are responsible for maintaining the confidentiality of your account credentials and OTP codes</li>
            <li>You agree to provide accurate and complete information during registration</li>
            <li>For security, accounts are automatically logged out after 30 minutes of inactivity</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            <li>You are responsible for all activities that occur under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">9. Prohibited Use</h2>
          <p className="mb-2">You agree not to use the website to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Engage in any fraudulent, deceptive, or illegal activity</li>
            <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
            <li>Use automated bots, scrapers, or any tool to extract data without permission</li>
            <li>Resell our products without prior written authorization</li>
            <li>Post false, defamatory, or infringing reviews or content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">10. Intellectual Property</h2>
          <p>All content on this website, including text, graphics, logos, images, product designs, and software, is the property of Putul Fashions and is protected by Indian and international copyright laws. Unauthorized reproduction, distribution, or modification is prohibited.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">11. Disclaimer of Warranties</h2>
          <p>Our website and products are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the website will be uninterrupted, error-free, or free from viruses or other harmful components.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">12. Limitation of Liability</h2>
          <p>Putul Fashions shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the purchase price of the product in question.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">13. Indemnification</h2>
          <p>You agree to indemnify and hold Putul Fashions harmless from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from your violation of these Terms or misuse of the website.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">14. Dispute Resolution</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Any disputes shall first be attempted to be resolved amicably by contacting our Grievance Officer</li>
            <li>If unresolved, disputes shall be settled through arbitration in accordance with the Arbitration and Conciliation Act, 1996</li>
            <li>The seat of arbitration shall be in India, and proceedings shall be conducted in English</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">15. Governing Law & Jurisdiction</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">16. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. Updated terms will be posted on this page with a revised "Last updated" date. Continued use of the website after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">17. Grievance Officer</h2>
          <p>In accordance with the Consumer Protection (E-Commerce) Rules, 2020, and the Information Technology Act, 2000, our Grievance Officer can be contacted at:</p>
          <div className="mt-3 space-y-1 text-foreground/70">
            <p><strong>Grievance Officer – Putul Fashions</strong></p>
            <p>Email: support@putulfashions.com</p>
            <p>Phone: +91 80006 85588</p>
            <p>Response time: Within 48 hours of receiving the complaint</p>
            <p>Resolution time: Within 30 days as per applicable law</p>
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Contact Us</h2>
          <p>For questions about these Terms of Service, contact us at:</p>
          <div className="mt-3 space-y-1 text-foreground/70">
            <p><strong>Putul Fashions</strong></p>
            <p>Email: support@putulfashions.com</p>
            <p>Phone: +91 80006 85588</p>
            <p>Support Hours: Mon–Sat, 10:00 AM – 7:00 PM IST</p>
          </div>
        </section>
      </div>
    </div>
  </div>
);

export default TermsOfServicePage;
