import { Fingerprint, Hash, Layers, Smartphone } from "lucide-react";
import { Motion } from "@/components/Motion";

const features = [
  {
    icon: Fingerprint,
    title: "UDID",
    description: "Unique Device Identifier for app provisioning and device management",
    highlight: true,
  },
  {
    icon: Smartphone,
    title: "Device Model",
    description: "Hardware model details when iOS provides them in the profile response",
  },
  {
    icon: Layers,
    title: "iOS / iPadOS Version",
    description: "Current operating system version and build number",
  },
  {
    icon: Hash,
    title: "Serial Number",
    description: "Serial, IMEI, MEID, and related identifiers when available from iOS",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Motion
            as="p"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 text-sm font-semibold tracking-wider text-blue-600 uppercase"
          >
            Device Information
          </Motion>
          <Motion
            as="h2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-slate-900 md:text-4xl"
          >
            What you&apos;ll get
          </Motion>
          <Motion
            as="p"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-600"
          >
            The result page shows the identifiers iOS provides for your device
          </Motion>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Motion
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl border bg-white p-6 transition-all duration-300 hover:shadow-lg ${feature.highlight ? "border-blue-200 shadow-md shadow-blue-100/50" : "border-slate-100 hover:border-slate-200 hover:shadow-slate-100"}`}
            >
              {feature.highlight && (
                <div className="absolute -top-3 left-6 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white uppercase">
                  Primary
                </div>
              )}
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.highlight ? "bg-blue-50" : "bg-slate-50"}`}
              >
                <feature.icon
                  className={`h-5 w-5 ${feature.highlight ? "text-blue-600" : "text-slate-600"}`}
                  aria-hidden="true"
                />
              </div>
              <h3 className="mb-2 text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{feature.description}</p>
            </Motion>
          ))}
        </div>
      </div>
    </section>
  );
}
