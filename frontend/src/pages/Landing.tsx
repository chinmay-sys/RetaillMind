import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, Brain, TrendingUp, Package, DollarSign, Users,
  BarChart3, Zap, Shield, ArrowRight, ChevronDown, ChevronUp,
  Star, Check, MessageSquare, Bot, Database, Cpu, GitBranch,
  Layers, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  { icon: Brain, title: 'AI Decision Engine', description: 'Multi-agent AI system that analyzes data, predicts trends, and recommends optimal business strategies in real-time.', color: '#5B5CEB' },
  { icon: TrendingUp, title: 'Demand Forecasting', description: 'ML-powered demand predictions with 94% accuracy, accounting for seasonality, festivals, and market trends.', color: '#7C3AED' },
  { icon: Package, title: 'Inventory Intelligence', description: 'Smart stock monitoring with dynamic safety stock calculations, reorder alerts, and overstock prevention.', color: '#14B8A6' },
  { icon: DollarSign, title: 'Price Optimization', description: 'Competitive pricing analysis with profit margin optimization and automated discount recommendations.', color: '#F59E0B' },
  { icon: Users, title: 'Supplier Analytics', description: 'Comprehensive supplier scoring with delivery tracking, reliability metrics, and procurement optimization.', color: '#EF4444' },
  { icon: BarChart3, title: 'Business Analytics', description: 'Interactive dashboards with revenue trends, customer insights, category analysis, and store comparisons.', color: '#10B981' },
]

const workflow = [
  { step: '01', title: 'Data Ingestion', description: 'Real-time data from POS, inventory, suppliers, and market feeds flows into our unified data pipeline.', icon: Database },
  { step: '02', title: 'AI Processing', description: 'Five specialized AI agents analyze the data simultaneously — demand, inventory, pricing, supplier, and decision intelligence.', icon: Cpu },
  { step: '03', title: 'Agent Orchestration', description: 'The Decision Intelligence Agent coordinates all agents, resolving conflicts and synthesizing a unified strategy.', icon: GitBranch },
  { step: '04', title: 'Actionable Insights', description: 'Clear, prioritized recommendations delivered to your dashboard with confidence scores and expected business impact.', icon: Zap },
]

const techStack = [
  { name: 'React', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Python', category: 'Backend' },
  { name: 'FastAPI', category: 'API' },
  { name: 'LangGraph', category: 'Multi-Agent Framework' },
  { name: 'Gemini / OpenAI', category: 'LLM' },
  { name: 'XGBoost', category: 'Forecasting' },
  { name: 'DistilBERT', category: 'NLP Sentiment' },
  { name: 'RAG', category: 'Retrieval' },
  { name: 'Qdrant', category: 'Vector Store' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'SQLite', category: 'Local Storage' },
]

const testimonials = [
  { name: 'Rajesh Sharma', role: 'VP Operations, MegaMart India', quote: 'RetailMind AI reduced our stockouts by 34% and improved forecast accuracy from 78% to 94%. The AI agents feel like having a team of analysts working 24/7.', rating: 5 },
  { name: 'Priya Deshmukh', role: 'Head of Procurement, TechBazaar', quote: 'The supplier intelligence module alone saved us ₹2.3 Crore in procurement costs last quarter. The competitive pricing analysis is incredibly precise.', rating: 5 },
  { name: 'Vikram Malhotra', role: 'CEO, UrbanRetail Co.', quote: 'We went from gut-feel decisions to data-driven strategies overnight. The AI chat feature lets even non-technical staff get instant business insights.', rating: 5 },
]

const faqs = [
  { q: 'What makes RetailMind AI different from traditional inventory management software?', a: 'RetailMind AI is not inventory management — it\'s a decision intelligence platform. While inventory management tracks stock, we use multi-agent AI systems to predict demand, optimize pricing, evaluate suppliers, and provide strategic business recommendations. Think of it as an AI-powered chief strategy officer for retail.' },
  { q: 'How does the multi-agent AI system work?', a: 'We deploy five specialized AI agents — Demand Forecasting, Inventory Intelligence, Pricing Optimization, Supplier Analysis, and a meta Decision Intelligence agent. Each agent specializes in its domain, and the Decision Intelligence agent orchestrates them all, resolving conflicts and producing unified, actionable strategies.' },
  { q: 'What kind of accuracy can I expect from demand forecasts?', a: 'Our XGBoost regression model with 7-day, 14-day, and 30-day lag and rolling statistics achieves 94% forecast accuracy on average. Accuracy improves over time as the system learns your specific business patterns, seasonality, and customer behavior. Festival and seasonal impacts are automatically factored in.' },
  { q: 'Can RetailMind AI integrate with my existing systems?', a: 'Yes. We provide REST APIs and webhook integrations for POS systems, ERP software, supplier portals, and e-commerce platforms. The platform is designed to augment your existing stack, not replace it.' },
  { q: 'Is my business data secure?', a: 'Absolutely. We use end-to-end encryption, SOC 2 compliant infrastructure, and role-based access control. Your data is never used to train models for other customers. We also support on-premise deployment for enterprise clients.' },
]

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">RetailMind AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors">How it Works</a>
              <a href="#tech" className="text-sm text-muted hover:text-foreground transition-colors">Technology</a>
              <a href="#faq" className="text-sm text-muted hover:text-foreground transition-colors">FAQ</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth/register">
                <Button size="sm">Get Started <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 pb-4 space-y-2"
          >
            <a href="#features" className="block py-2 text-sm text-muted">Features</a>
            <a href="#how-it-works" className="block py-2 text-sm text-muted">How it Works</a>
            <a href="#tech" className="block py-2 text-sm text-muted">Technology</a>
            <a href="#faq" className="block py-2 text-sm text-muted">FAQ</a>
            <div className="flex gap-2 pt-2">
              <Link to="/auth/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Sign In</Button></Link>
              <Link to="/auth/register" className="flex-1"><Button className="w-full" size="sm">Get Started</Button></Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="default" className="mb-6 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Powered by Multi-Agent AI & RAG
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
              Retail Decisions,{' '}
              <span className="text-gradient">Intelligently</span>{' '}
              Automated
            </h1>
            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              An agentic AI platform that forecasts demand, optimizes inventory, 
              recommends pricing, and delivers strategic business intelligence — all in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/app">
                <Button size="xl" className="group">
                  Launch Dashboard
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="outline" size="xl">
                  View Demo
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>94% Forecast Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>5 AI Agents</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Real-time Insights</span>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 sm:p-4 mx-auto max-w-5xl">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 sm:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Revenue', value: '₹4.8M', change: '+12.5%', color: 'text-primary' },
                    { label: 'Sales', value: '12,847', change: '+8.2%', color: 'text-secondary' },
                    { label: 'Forecast', value: '94%', change: '+2.1%', color: 'text-accent' },
                    { label: 'AI Score', value: '96%', change: '+1.4%', color: 'text-success' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="bg-white rounded-xl p-4 shadow-soft"
                    >
                      <p className="text-xs text-muted mb-1">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-success">{stat.change}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-soft h-48 flex items-center justify-center">
                    <div className="w-full h-full flex items-end justify-around px-4 gap-2">
                      {[40, 55, 45, 65, 70, 60, 75, 80, 72, 85, 82, 90].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-primary/80 to-primary/30 rounded-t-md"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-soft space-y-3">
                    <p className="text-xs font-medium text-foreground">AI Agents Status</p>
                    {['Demand Agent', 'Inventory Agent', 'Pricing Agent'].map((agent, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-muted">{agent}</span>
                        <span className="text-xs text-success ml-auto">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to make<br />smarter retail decisions
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Six core modules powered by specialized AI agents, working together to transform raw data into strategic advantage.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full card-hover border-gray-100 hover:border-transparent">
                  <CardContent className="p-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${feature.color}12` }}
                    >
                      <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Workflow */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="accent" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              From raw data to<br />actionable intelligence
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Our four-stage pipeline transforms retail data into strategic decisions in seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <Card className="h-full border-gray-100">
                  <CardContent className="p-6">
                    <span className="text-5xl font-black text-gray-100 mb-4 block">{step.step}</span>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture / Tech Stack */}
      <section id="tech" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="default" className="mb-4">Technology Stack</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Built with modern,<br />production-grade technologies
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Enterprise-ready architecture designed for scale, performance, and reliability.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                  <p className="text-sm font-medium text-foreground">{tech.name}</p>
                  <p className="text-[10px] text-muted">{tech.category}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Architecture Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-center mb-8">System Architecture</h3>
                <div className="space-y-4">
                  {/* Layer 1: Frontend */}
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <p className="text-xs font-medium text-primary mb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Presentation Layer
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['React Dashboard', 'AI Chat Interface', 'Analytics Console', 'Real-time Alerts'].map(item => (
                        <span key={item} className="px-3 py-1 bg-white rounded-lg text-xs text-foreground shadow-sm">{item}</span>
                      ))}
                    </div>
                  </div>
                  {/* Layer 2: API */}
                  <div className="bg-secondary/5 rounded-xl p-4 border border-secondary/10">
                    <p className="text-xs font-medium text-secondary mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4" /> AI Agent Layer
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Demand Agent', 'Inventory Agent', 'Pricing Agent', 'Supplier Agent', 'Decision Orchestrator'].map(item => (
                        <span key={item} className="px-3 py-1 bg-white rounded-lg text-xs text-foreground shadow-sm">{item}</span>
                      ))}
                    </div>
                  </div>
                  {/* Layer 3: ML */}
                  <div className="bg-accent/5 rounded-xl p-4 border border-accent/10">
                    <p className="text-xs font-medium text-accent mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" /> ML & LLM Layer
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['XGBoost Forecaster', 'DistilBERT Sentiment', 'Gemini / OpenAI RAG', 'LangGraph Agents', 'Qdrant Vector Store'].map(item => (
                        <span key={item} className="px-3 py-1 bg-white rounded-lg text-xs text-foreground shadow-sm">{item}</span>
                      ))}
                    </div>
                  </div>
                  {/* Layer 4: Data */}
                  <div className="bg-warning/5 rounded-xl p-4 border border-warning/10">
                    <p className="text-xs font-medium text-warning mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4" /> Data Layer
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['PostgreSQL', 'Redis Cache', 'Data Pipeline', 'ETL Jobs', 'Real-time Streams'].map(item => (
                        <span key={item} className="px-3 py-1 bg-white rounded-lg text-xs text-foreground shadow-sm">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="warning" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Trusted by leading retailers
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-sm text-muted leading-relaxed mb-6">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="default" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently asked questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left bg-white rounded-xl p-5 border border-gray-100 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-muted shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                    )}
                  </div>
                  {openFaq === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-sm text-muted leading-relaxed mt-3 pt-3 border-t border-gray-100"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to transform your retail operations?
            </h2>
            <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">
              Join 500+ retailers who are already making smarter decisions with AI-powered intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/app">
                <Button size="lg" className="group">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/app/chat">
                <Button variant="outline" size="lg">
                  <MessageSquare className="w-4 h-4" />
                  Talk to AI
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold">RetailMind AI</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                An Agentic Retail Decision Intelligence Platform.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-white/80">Product</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-white/80">Resources</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-white/80">Company</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/40">© 2026 RetailMind AI. All rights reserved.</p>
            <p className="text-xs text-white/40">Built as a Final Year Engineering Project</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
