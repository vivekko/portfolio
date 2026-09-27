'use client';

const ROWS = [
  {
    category: 'Languages',
    items: 'Java 8–17, Python, JavaScript, SQL, C++',
  },
  {
    category: 'Spring ecosystem',
    items: 'Spring Boot, MVC, WebFlux, Spring Security, Hibernate/JPA, Dropwizard',
  },
  {
    category: 'Streaming & messaging',
    items: 'Apache Kafka, Amazon Kinesis, RabbitMQ, event-driven design',
  },
  {
    category: 'Cloud & infrastructure',
    items: 'AWS (Lambda, S3, ECS), Docker, Kubernetes, Istio, Terraform',
  },
  {
    category: 'Data & caching',
    items: 'PostgreSQL, MySQL, MongoDB, DynamoDB, Redis',
  },
  {
    category: 'Delivery',
    items: 'Jenkins, Concourse, GitHub Actions, Maven, Gradle',
  },
  {
    category: 'Observability',
    items: 'DataDog, Splunk, Grafana, Jaeger, Superset',
  },
  {
    category: 'Security & identity',
    items: 'OAuth2/OIDC, SAML, JWT, Keycloak, CVE remediation',
  },
];

export default function Stack() {
  return (
    <section id="stack" className="relative z-10 bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-28 lg:px-8">
        <h2 className="type-display mb-16 text-[clamp(2.4rem,6vw,4.5rem)] text-bone">
          Working stack
        </h2>

        <div className="border-t border-line">
          {ROWS.map((row) => (
            <div
              key={row.category}
              className="group relative grid grid-cols-1 gap-1 border-b border-line py-6 transition-colors duration-300 hover:bg-panel/60 sm:grid-cols-[minmax(14rem,18rem)_1fr] sm:items-baseline sm:gap-8 sm:py-7"
            >
              {/* marker that grows on hover */}
              <span className="absolute left-0 top-0 h-full w-px scale-y-0 bg-signal transition-transform duration-500 ease-out group-hover:scale-y-100" />
              <h3 className="type-subdisplay pl-0 text-xl text-bone transition-[padding] duration-500 ease-out group-hover:pl-5 sm:text-2xl">
                {row.category}
              </h3>
              <p className="text-sm leading-relaxed text-mist">{row.items}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
