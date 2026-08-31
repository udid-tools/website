import { Clock, Code2, Server, Shield, UserX } from "lucide-react";
import { Motion } from "@/components/Motion";

const features = [
  {
    icon: Clock,
    title: "No Account Record",
    description: "The flow is designed to show your result without creating a user account.",
  },
  {
    icon: UserX,
    title: "No Apple ID Required",
    description: "Works entirely through a configuration profile. No account or login needed.",
  },
  {
    icon: Server,
    title: "No Intentional Retention",
    description: "UDID data is processed to display the result, not to build a stored profile.",
  },
  {
    icon: Code2,
    title: "Open Source",
    description: "The project is public on GitHub, so the implementation can be inspected.",
  },
];

export function PrivacySection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Motion
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-3 text-sm font-semibold tracking-wider text-blue-600 uppercase">
              Privacy &amp; Security
            </p>
            <h2 className="mb-6 text-3xl font-bold text-slate-900 md:text-4xl">
              Your data stays yours
            </h2>
            <p className="mb-8 leading-relaxed text-slate-600">
              UDID Tools is an open-source project built to solve one practical problem: show your
              Apple device identifier without asking for an account, payment, Apple ID, or desktop
              software.
            </p>
            <a
              href="https://github.com/udid-tools/website"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 transition-colors hover:border-green-200 hover:bg-green-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Shield className="h-4 w-4 text-green-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">
                  Public source code, simple flow
                </p>
                <p className="text-xs text-green-700">
                  Review the implementation before using the tool
                </p>
              </div>
            </a>
          </Motion>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <Motion
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white">
                  <feature.icon className="h-4 w-4 text-slate-600" aria-hidden="true" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{feature.description}</p>
              </Motion>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
