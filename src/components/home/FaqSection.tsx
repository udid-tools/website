import { Motion } from "@/components/Motion";

const faqs = [
  {
    question: "Can I get my iPhone UDID online?",
    answer:
      "Yes. Open UDID Tools in Safari on the iPhone or iPad you want to identify, download the configuration profile, install it in Settings, and copy the UDID from the result page.",
  },
  {
    question: "Do I need iTunes, Finder, or Xcode?",
    answer:
      "No. The flow runs on the device itself through Safari and iOS Settings, so you do not need a Mac, PC, USB cable, iTunes, Finder, or Xcode.",
  },
  {
    question: "Is UDID Tools open source?",
    answer:
      "Yes. UDID Tools is open-source. The source code is linked from the footer so you can inspect how the profile flow works.",
  },
  {
    question: "Does UDID Tools store my device information?",
    answer:
      "The service is designed not to create accounts or persist your UDID. Device data is processed to display the result back to you, and the privacy policy explains the hosting and logging caveats.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <Motion
            as="p"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 text-sm font-semibold tracking-wider text-blue-600 uppercase"
          >
            FAQ
          </Motion>
          <Motion
            as="h2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-slate-900 md:text-4xl"
          >
            Questions people ask before getting a UDID
          </Motion>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Motion
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-slate-100 bg-white p-6"
            >
              <h3 className="font-semibold text-slate-900">{faq.question}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{faq.answer}</p>
            </Motion>
          ))}
        </div>
      </div>
    </section>
  );
}
