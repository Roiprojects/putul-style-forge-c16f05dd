const TermsOfServicePage = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-3xl">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-xs text-muted-foreground mb-10">Last updated: 26 March 2026</p>

      <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using the Putul Fashions website (putulfashions.com), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. Products & Pricing</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>All product descriptions, images, and specifications are as accurate as possible but may vary slightly from actual products due to display settings</li>
            <li>Prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise</li>
            <li>We reserve the right to modify prices without prior notice. The price at the time of order placement will be honored</li>
            <li>In case of pricing errors, we reserve the right to cancel orders and issue full refunds</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. Orders & Payments</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Placing an order constitutes an offer to purchase. We may accept or decline orders at our discretion</li>
            <li>All payments are processed securely through Razorpay payment gateway</li>
            <li>We accept UPI, Credit/Debit Cards, Net Banking, and digital wallets</li>
            <li>Cash on Delivery (COD) is available for select locations at an additional convenience charge</li>
            <li>Orders will be confirmed upon successful payment verification</li>
            <li>An order confirmation email/SMS will be sent upon successful placement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. Shipping & Delivery</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>We deliver across India through trusted courier partners</li>
            <li>Estimated delivery timelines are indicative and may vary based on location and availability</li>
            <li>Shipping charges are calculated based on delivery location and order value</li>
            <li>Free shipping is available on orders above the threshold displayed at checkout</li>
            <li>Risk of loss and title for items pass to you upon delivery to the carrier</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Returns & Refunds</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Returns are accepted within <strong>7 days</strong> of delivery for unused, unworn products in original packaging</li>
            <li>Items must be in their original condition with all tags attached</li>
            <li>To initiate a return, contact us at support@putulfashions.com or use the Return Request option in your order details</li>
            <li>Refunds will be processed within <strong>5-7 business days</strong> after we receive and inspect the returned item</li>
            <li>Refunds will be credited to the original payment method or as store credit (as chosen by you)</li>
            <li>Shipping charges are non-refundable unless the return is due to our error (defective/wrong item)</li>
            <li>Sale or discounted items may have different return policies as specified on the product page</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. Cancellation Policy</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Orders can be cancelled before they are shipped</li>
            <li>Once an order is shipped, it cannot be cancelled but may be returned after delivery</li>
            <li>Full refund will be issued for successfully cancelled orders within 3-5 business days</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. User Accounts</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You agree to provide accurate and complete information during registration</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            <li>You are responsible for all activities that occur under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">8. Intellectual Property</h2>
          <p>All content on this website, including text, graphics, logos, images, product designs, and software, is the property of Putul Fashions and is protected by Indian and international copyright laws. Unauthorized reproduction, distribution, or modification is prohibited.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">9. Limitation of Liability</h2>
          <p>Putul Fashions shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the purchase price of the product in question.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">10. Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">11. Grievance Officer</h2>
          <p>In accordance with the Consumer Protection (E-Commerce) Rules, 2020, our Grievance Officer can be contacted at:</p>
          <div className="mt-3 space-y-1 text-foreground/70">
            <p>Email: support@putulfashions.com</p>
            <p>Phone: +91 80006 85588</p>
            <p>Response time: Within 48 hours of receiving the complaint</p>
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Contact Us</h2>
          <p>For questions about these Terms of Service, contact us at:</p>
          <div className="mt-3 space-y-1 text-foreground/70">
            <p><strong>Putul Fashions</strong></p>
            <p>Email: support@putulfashions.com</p>
            <p>Phone: +91 80006 85588</p>
          </div>
        </section>
      </div>
    </div>
  </div>
);

export default TermsOfServicePage;
