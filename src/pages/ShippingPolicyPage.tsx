import BackButton from "@/components/BackButton";

const ShippingPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-3xl">
      <BackButton />
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Shipping Policy</h1>
      <p className="text-xs text-muted-foreground mb-10">Last updated: 26 March 2026</p>

      <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Shipping Coverage</h2>
          <p>We currently ship to all serviceable pin codes across India. We use trusted logistics partners to ensure safe and timely delivery of your orders.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. Processing Time</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Orders are processed within <strong>1-2 business days</strong> after payment confirmation</li>
            <li>Orders placed on weekends or public holidays will be processed on the next business day</li>
            <li>You will receive an order confirmation email/SMS with tracking details once your order is dispatched</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. Estimated Delivery Time</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-border rounded-lg overflow-hidden text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Zone</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Estimated Delivery</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Shipping Charge</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Metro Cities (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad)</td>
                  <td className="px-4 py-3">3-5 business days</td>
                  <td className="px-4 py-3">₹49 (Free above ₹999)</td>
                </tr>
                <tr className="border-t border-border bg-muted/50">
                  <td className="px-4 py-3">Tier 2 Cities</td>
                  <td className="px-4 py-3">5-7 business days</td>
                  <td className="px-4 py-3">₹69 (Free above ₹999)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Rest of India</td>
                  <td className="px-4 py-3">7-10 business days</td>
                  <td className="px-4 py-3">₹99 (Free above ₹1499)</td>
                </tr>
                <tr className="border-t border-border bg-muted/50">
                  <td className="px-4 py-3">Remote / North-East / J&K / Ladakh</td>
                  <td className="px-4 py-3">10-14 business days</td>
                  <td className="px-4 py-3">₹149</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">* Delivery timelines are estimated and may vary due to unforeseen circumstances, weather conditions, or courier delays.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. Free Shipping</h2>
          <p>Enjoy free standard shipping on prepaid orders above ₹999 to most locations. Specific pin codes may have different thresholds as shown in the table above.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Order Tracking</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Once your order is shipped, you will receive a tracking number via email and SMS</li>
            <li>Track your order status from the <strong>My Orders</strong> section in your account</li>
            <li>You can also track directly on the courier partner's website using the tracking number</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. Cash on Delivery (COD)</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>COD is available for select pin codes</li>
            <li>An additional convenience charge of ₹40 applies to COD orders</li>
            <li>COD orders are subject to verification — a confirmation call/SMS may be made before dispatch</li>
            <li>COD is available for orders up to ₹5,000</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. Failed Delivery</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>If delivery fails due to incorrect address or unavailability, our courier partner will attempt redelivery</li>
            <li>After 2 failed delivery attempts, the order will be returned to us</li>
            <li>For prepaid orders, a full refund (minus shipping charges) will be processed</li>
            <li>Please ensure your address and phone number are correct to avoid delays</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">8. Damaged / Wrong Items</h2>
          <p>If you receive a damaged or incorrect product, please contact us within <strong>48 hours</strong> of delivery with photos/videos of the issue. We will arrange a free pickup and send a replacement or process a full refund at no additional cost.</p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Need Help?</h2>
          <p>For shipping-related queries, reach out to us:</p>
          <div className="mt-3 space-y-1 text-foreground/70">
            <p><strong>Putul Fashions</strong></p>
            <p>Email: support@putulfashions.com</p>
            <p>Phone: +91 80006 85588</p>
            <p>Available: Mon–Sat, 10 AM – 7 PM IST</p>
          </div>
        </section>
      </div>
    </div>
  </div>
);

export default ShippingPolicyPage;
