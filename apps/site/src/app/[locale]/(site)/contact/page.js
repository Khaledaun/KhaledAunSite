import ContactForm from '@/components/site/ContactForm';

export default async function ContactPage({params: {locale}}) {
  return (
    <main id="main-content">
      <section className="min-h-screen bg-brand-sand py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-heading font-bold mb-6 text-brand-navy text-center">
              Contact
            </h1>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-lg text-brand-ink mb-8 text-center">
                Get in touch for legal consultation and business growth opportunities.
              </p>
              
              {/* Contact Form */}
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
