'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Terminal, Code, FileJson } from 'lucide-react';

const codeSnippets = [
  {
    title: 'Microservice Architecture',
    language: 'java',
    icon: Code,
    code: `@SpringBootApplication
@EnableEurekaClient
public class OrderServiceApplication {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public static void main(String[] args) {
        SpringApplication.run(
            OrderServiceApplication.class, args
        );
    }
}

@Service
public class OrderService {

    @Autowired
    private KafkaTemplate<String, Order> kafka;

    @Autowired
    private RestTemplate restTemplate;

    @Transactional
    public Order createOrder(OrderRequest request) {
        // Validate with Auth Service
        Boolean isValid = restTemplate
            .getForObject(
                "http://auth-service/validate",
                Boolean.class
            );

        // Create order
        Order order = new Order(request);
        orderRepository.save(order);

        // Publish event to Kafka
        kafka.send("orders", order);

        return order;
    }
}`,
  },
  {
    title: 'Kafka Event Producer',
    language: 'java',
    icon: Terminal,
    code: `@Service
@Slf4j
public class EventProducer {

    @Autowired
    private KafkaTemplate<String, Event> kafka;

    @Value("\${kafka.topic.events}")
    private String topic;

    public void publishEvent(Event event) {
        ListenableFuture<SendResult<String, Event>>
            future = kafka.send(topic, event.getId(), event);

        future.addCallback(
            result -> log.info("Event published: {}",
                event.getId()),
            ex -> log.error("Failed to publish: {}",
                event.getId(), ex)
        );
    }

    @KafkaListener(topics = "order-events")
    public void handleOrderEvent(
        @Payload OrderEvent event,
        @Header(KafkaHeaders.RECEIVED_KEY) String key
    ) {
        log.info("Processing order: {}", key);
        processOrder(event);
    }
}`,
  },
  {
    title: 'Kubernetes Deployment',
    language: 'yaml',
    icon: FileJson,
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
        version: v1
    spec:
      containers:
      - name: order-service
        image: order-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        - name: KAFKA_BOOTSTRAP_SERVERS
          value: "kafka:9092"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10`,
  },
  {
    title: 'Istio Service Mesh',
    language: 'yaml',
    icon: FileJson,
    code: `apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: order-service
spec:
  hosts:
  - order-service
  http:
  - match:
    - headers:
        canary:
          exact: "true"
    route:
    - destination:
        host: order-service
        subset: v2
      weight: 20
    - destination:
        host: order-service
        subset: v1
      weight: 80
  - route:
    - destination:
        host: order-service
        subset: v1
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: order-service
spec:
  host: order-service
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 2`,
  },
];

export default function CodeEditor() {
  const [activeTab, setActiveTab] = useState(0);
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setIsTyping(true);
    setDisplayedCode('');
    const code = codeSnippets[activeTab].code;
    let index = 0;

    const interval = setInterval(() => {
      if (index < code.length) {
        setDisplayedCode(code.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {codeSnippets.map((snippet, index) => {
          const Icon = snippet.icon;
          return (
            <motion.button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-300 ${
                activeTab === index
                  ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={16} />
              <span className="text-sm font-medium hidden sm:inline">{snippet.title}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Editor Window */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-2xl"
      >
        {/* Editor Header */}
        <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-4 text-slate-400 text-sm font-mono">
              {codeSnippets[activeTab].title}.{codeSnippets[activeTab].language}
            </span>
          </div>
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">Typing...</span>
            </div>
          )}
        </div>

        {/* Code Content */}
        <div className="relative overflow-x-auto max-h-[500px] overflow-y-auto">
          <SyntaxHighlighter
            language={codeSnippets[activeTab].language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: '#0f172a',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
            showLineNumbers
          >
            {displayedCode}
          </SyntaxHighlighter>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700">
          <div className="flex items-center gap-4">
            <span>Lines: {displayedCode.split('\n').length}</span>
            <span>Lang: {codeSnippets[activeTab].language.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Ready</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
