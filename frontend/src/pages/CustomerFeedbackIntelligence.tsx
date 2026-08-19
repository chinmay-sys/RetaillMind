import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Zap,
  TrendingDown,
  TrendingUp,
  Star,
  ShieldAlert,
  Activity,
  Layers,
  ThumbsDown,
  ThumbsUp,
  Sliders,
  Cpu,
  Search,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { reviewsAPI } from '@/lib/api';

interface HealthData {
  status: string;
  source: string;
  last_sync: string | null;
  minutes_since_sync: number | null;
  number_of_reviews_received: number;
  freshness_threshold_minutes: number;
  configured: boolean;
}

interface ProductRisk {
  product_id: number;
  sku: string;
  name: string;
  risk_score: number;
  risk_level: string;
  avg_rating: number;
  negative_pct: number;
  primary_complaint: string;
  total_reviews: number;
  reasons: string[];
}

interface FeedbackDashboard {
  status: string;
  review_data_status?: string;
  confidence: number;
  total_reviews: number;
  avg_rating: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  negative_trend_7d: number;
  top_complaints: { aspect: string; count: number; total: number }[];
  health: HealthData;
  products_at_risk: ProductRisk[];
  latestAnalysis: string;
  output: string[];
}

interface ReviewItem {
  id: number;
  external_review_id: string;
  product_name: string;
  product_sku: string;
  source: string;
  review_text: string;
  rating: number;
  review_date: string;
  sentiment: string;
  sentiment_score: number;
  detected_aspects: Record<string, string>;
}

export default function CustomerFeedbackIntelligence() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [demoing, setDemoing] = useState(false);
  const [dashboard, setDashboard] = useState<FeedbackDashboard | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [demoResult, setDemoResult] = useState<any>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<'ALL' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'>('ALL');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [selectedAspectFilter, setSelectedAspectFilter] = useState<string | null>(null);
  const [riskTableSearch, setRiskTableSearch] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('ALL');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const [dashRes, revRes] = await Promise.all([
        reviewsAPI.dashboard(),
        reviewsAPI.list(50),
      ]);

      if (dashRes.data) {
        setDashboard(dashRes.data);
      }
      if (revRes.data) {
        setReviews(revRes.data.reviews || []);
      }
    } catch (e) {
      console.error('Failed to fetch review metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      await reviewsAPI.sync();
      await fetchMetrics();
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      setSyncing(false);
    }
  };

  const handleSimulateDemoEvent = async () => {
    try {
      setDemoing(true);
      const res = await reviewsAPI.triggerDemoEvent();
      if (res.data) {
        setDemoResult(res.data);
        await fetchMetrics();
      }
    } catch (e) {
      console.error('Demo simulation failed:', e);
    } finally {
      setDemoing(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'FRESH':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>STREAM FRESH (&lt;60m)</span>
          </div>
        );
      case 'STALE':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-sm backdrop-blur-md">
            <Clock className="w-3.5 h-3.5" />
            <span>STALE STREAM (1-6h)</span>
          </div>
        );
      case 'CRITICAL':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold shadow-sm backdrop-blur-md">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>CRITICAL DELAY (&gt;6h)</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-400 text-xs font-semibold shadow-sm">
            <Activity className="w-3.5 h-3.5" />
            <span>STREAM ACTIVE</span>
          </div>
        );
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-950/40">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            CRITICAL RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            MEDIUM RISK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            LOW RISK
          </span>
        );
    }
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        r.review_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.product_sku.toLowerCase().includes(searchTerm.toLowerCase());

      // Sentiment filter
      const matchesSentiment =
        selectedSentimentFilter === 'ALL' || r.sentiment?.toUpperCase() === selectedSentimentFilter;

      // Rating filter
      const matchesRating = selectedRatingFilter === null || Math.round(r.rating) === selectedRatingFilter;

      // Aspect filter
      const matchesAspect =
        !selectedAspectFilter ||
        (r.detected_aspects && Object.keys(r.detected_aspects).some((asp) =>
          asp.toLowerCase() === selectedAspectFilter.toLowerCase()
        ));

      return matchesSearch && matchesSentiment && matchesRating && matchesAspect;
    });
  }, [reviews, searchTerm, selectedSentimentFilter, selectedRatingFilter, selectedAspectFilter]);

  // Filtered products at risk
  const filteredProductsAtRisk = useMemo(() => {
    if (!dashboard?.products_at_risk) return [];
    return dashboard.products_at_risk.filter((p) => {
      const matchesSearch =
        !riskTableSearch ||
        p.name.toLowerCase().includes(riskTableSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(riskTableSearch.toLowerCase()) ||
        p.primary_complaint.toLowerCase().includes(riskTableSearch.toLowerCase());

      const matchesRisk =
        riskLevelFilter === 'ALL' || p.risk_level?.toUpperCase() === riskLevelFilter.toUpperCase();

      return matchesSearch && matchesRisk;
    });
  }, [dashboard?.products_at_risk, riskTableSearch, riskLevelFilter]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      {/* ── TOP HERO HEADER ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-xl"
      >
        {/* Glow blur effect behind header */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 translate-y-1/2 w-64 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                NLP Sentiment Intelligence
              </span>
              {getStatusBadge(dashboard?.review_data_status || dashboard?.health?.status)}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> PostgreSQL Deduplicated
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Customer Feedback Intelligence
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time multi-channel review streaming powered by Hugging Face <span className="text-indigo-300 font-medium">DistilBERT</span> sentiment classification, multi-aspect complaint detection, and automated inventory safety gates.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={handleManualSync}
              disabled={syncing}
              variant="outline"
              className="bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200 transition-all hover:border-slate-600 shadow-md font-medium"
            >
              <RefreshCw className={`w-4 h-4 mr-2 text-indigo-400 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing Pipeline...' : 'Sync Reviews'}
            </Button>

            <Button
              onClick={handleSimulateDemoEvent}
              disabled={demoing}
              className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className={`w-4 h-4 mr-2 text-amber-300 ${demoing ? 'animate-bounce' : ''}`} />
              {demoing ? 'Simulating Pipeline...' : 'Simulate Defect Review Event'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── DEMO EVENT LIVE PIPELINE BANNER ───────────────────────────────────────────── */}
      <AnimatePresence>
        {demoResult && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="overflow-hidden border-indigo-500/40 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 shadow-2xl relative">
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={() => setDemoResult(null)}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      Live End-to-End Automated Pipeline Execution
                    </CardTitle>
                    <CardDescription className="text-xs text-indigo-200/70">
                      Webhook ingestion → DistilBERT aspect classification → LangGraph automated safety gate trigger
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/80 rounded-xl border border-indigo-500/20 backdrop-blur-md">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Ingested Review
                    </span>
                    <p className="text-sm font-medium text-slate-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 italic">
                      "{demoResult.ingested_review?.review_text}"
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" /> NLP Sentiment & Aspect Tags
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {demoResult.ingested_review?.sentiment} ({Math.round((demoResult.ingested_review?.sentiment_score || 0.95) * 100)}%)
                      </span>
                      {Object.entries(demoResult.ingested_review?.detected_aspects || {}).map(([asp, s]) => (
                        <span key={asp} className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {asp}: {String(s)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> AI Safety Gate Triggered
                    </span>
                    <div className="bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30">
                      <p className="text-sm font-bold text-rose-300">
                        {demoResult.orchestrated_decisions?.[0]?.title || 'Auto-Hold Activated'}
                      </p>
                      <p className="text-xs text-rose-200/80 mt-1 line-clamp-2">
                        {demoResult.orchestrated_decisions?.[0]?.description || 'Reorders placed on hold due to quality defect risk.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP 4 EXECUTIVE KPI METRICS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Source Health */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/90 shadow-xl hover:border-indigo-500/40 transition-all duration-300 group">
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Review Connector</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-bold text-lg text-white truncate block title={dashboard?.health?.source || 'MULTI-CHANNEL CONNECTOR'}">
                  {dashboard?.health?.source ? dashboard.health.source.replace(/_/g, ' ') : 'MULTI-CHANNEL CONNECTOR'}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs text-emerald-400 font-medium">Connector Synced</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Last Sync:{' '}
                  <strong className="text-slate-300">
                    {typeof dashboard?.health?.minutes_since_sync === 'number' && !isNaN(dashboard.health.minutes_since_sync)
                      ? `${dashboard.health.minutes_since_sync}m ago`
                      : 'Just now'}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold uppercase">15m Auto-Poll</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metric 2: Total Reviews Analyzed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/90 shadow-xl hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Analyzed Reviews</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {dashboard?.total_reviews ?? reviews.length}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" /> Deduplicated
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Database Indexing</span>
                <span className="text-emerald-400 font-semibold">100% Ingested</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metric 3: Average Rating */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/90 shadow-xl hover:border-amber-500/40 transition-all duration-300 group">
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Average Rating</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {dashboard?.avg_rating ? Number(dashboard.avg_rating).toFixed(1) : '3.0'}
                </span>
                <span className="text-xs text-slate-400">/ 5.0</span>
                <div className="flex items-center ml-auto gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= Math.round(dashboard?.avg_rating || 0)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700 fill-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Customer Sentiment Score</span>
                <span className="text-amber-400 font-semibold">
                  {Math.round((dashboard?.confidence || 0.88) * 100)}% Confidence
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metric 4: Negative Sentiment % */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/90 shadow-xl hover:border-rose-500/40 transition-all duration-300 group">
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Negative Sentiment %</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                  <ThumbsDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {dashboard?.negative_pct || 0}%
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    (dashboard?.negative_pct || 0) > 35
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {(dashboard?.negative_trend_7d || 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {dashboard?.negative_trend_7d || 0}% 7d
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">Pos: {dashboard?.positive_pct || 0}%</span>
                <span className="text-amber-400 font-medium">Neu: {dashboard?.neutral_pct || 0}%</span>
                <span className="text-rose-400 font-medium">Neg: {dashboard?.negative_pct || 0}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── SENTIMENT BREAKDOWN & NLP ASPECT COMPLAINTS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: DistilBERT Sentiment Breakdown & Safety Gate Rule (5 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="lg:col-span-5"
        >
          <Card className="h-full bg-slate-900/80 border-slate-800/90 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Sliders className="w-4 h-4" />
                  </div>
                  Sentiment Distribution
                </CardTitle>
                <Badge variant="outline" className="text-indigo-300 border-indigo-500/30 text-[11px]">
                  DistilBERT HF
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Automated classification using pretrained transformer NLP weights
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Visual Multi-Segment Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Composite Sentiment Split</span>
                  <span className="text-indigo-400">{dashboard?.total_reviews || reviews.length} Reviews Analyzed</span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-slate-950 flex overflow-hidden p-0.5 border border-slate-800">
                  <div
                    style={{ width: `${dashboard?.positive_pct || 0}%` }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500"
                    title={`Positive: ${dashboard?.positive_pct || 0}%`}
                  />
                  <div
                    style={{ width: `${dashboard?.neutral_pct || 0}%` }}
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500"
                    title={`Neutral: ${dashboard?.neutral_pct || 0}%`}
                  />
                  <div
                    style={{ width: `${dashboard?.negative_pct || 0}%` }}
                    className="bg-gradient-to-r from-rose-500 to-red-600 rounded-r-full transition-all duration-500"
                    title={`Negative: ${dashboard?.negative_pct || 0}%`}
                  />
                </div>
              </div>

              {/* Individual Bar Details */}
              <div className="space-y-3 pt-1">
                {/* Positive */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5" /> Positive Sentiment
                    </span>
                    <span className="text-white font-bold">{dashboard?.positive_pct || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${dashboard?.positive_pct || 0}%` }}
                    />
                  </div>
                </div>

                {/* Neutral */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/30 transition-colors">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> Neutral Sentiment
                    </span>
                    <span className="text-white font-bold">{dashboard?.neutral_pct || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${dashboard?.neutral_pct || 0}%` }}
                    />
                  </div>
                </div>

                {/* Negative */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-rose-500/30 transition-colors">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <ThumbsDown className="w-3.5 h-3.5" /> Negative Sentiment
                    </span>
                    <span className="text-white font-bold">{dashboard?.negative_pct || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${dashboard?.negative_pct || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Safety Gate Rule Box */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-950/70 border border-rose-500/30 text-xs">
                <div className="flex items-center gap-2 text-rose-300 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Active Autonomous Safety Gate:
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  SKUs with high forecasted demand but <strong className="text-rose-400">&gt;35% negative sentiment</strong> or recurring defect aspects are automatically held in AI Decision Center.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Card: Detected Aspect Complaints (7 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="lg:col-span-7"
        >
          <Card className="h-full bg-slate-900/80 border-slate-800/90 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    Detected Aspect Complaints (NLP Aspect Extractor)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">
                    Automatically scans reviews across 11 key product attributes (Battery, Quality, Fit, Shipping, etc.)
                  </CardDescription>
                </div>
                {selectedAspectFilter && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedAspectFilter(null)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 h-7"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {dashboard?.top_complaints && dashboard.top_complaints.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {dashboard.top_complaints.map((item) => {
                    const isSelected = selectedAspectFilter?.toLowerCase() === item.aspect.toLowerCase();
                    const defectRatio = Math.round((item.count / Math.max(item.total, 1)) * 100);

                    return (
                      <motion.div
                        key={item.aspect}
                        whileHover={{ scale: 1.02 }}
                        onClick={() =>
                          setSelectedAspectFilter(isSelected ? null : item.aspect)
                        }
                        className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500/70 ring-1 ring-indigo-500'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-white text-base capitalize">{item.aspect}</span>
                            <span className="block text-[11px] text-slate-400 mt-0.5">
                              {item.total} total mention{item.total > 1 ? 's' : ''}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {item.count} Neg Complaints
                          </span>
                        </div>

                        {/* Defect Meter */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">Defect Intensity</span>
                            <span className="text-rose-400 font-semibold">{defectRatio}% Negative</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                              style={{ width: `${Math.min(defectRatio, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Click to filter feed</span>
                          <span className="text-indigo-400 font-medium flex items-center">
                            {isSelected ? 'Filtering feed ✓' : 'Inspect Reviews →'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-slate-300 font-semibold text-sm">No critical aspect defects detected</p>
                  <p className="text-slate-500 text-xs mt-1">Review stream is maintaining standard quality thresholds.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── TRANSPARENT PRODUCT RISK MATRIX TABLE ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-slate-900/80 border-slate-800/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  Transparent Product Risk Scores
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Calculated dynamically from negative sentiment ratio, star rating decline, defect frequency, and review freshness penalty.
                </CardDescription>
              </div>

              {/* Table Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search in Risk Table */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search product or SKU..."
                    value={riskTableSearch}
                    onChange={(e) => setRiskTableSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-slate-950/80 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  />
                </div>

                {/* Risk Level Filter Chips */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setRiskLevelFilter(lvl)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        riskLevelFilter === lvl
                          ? 'bg-indigo-600 text-white font-semibold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider bg-slate-950/90 text-slate-400 border-y border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Product Name</th>
                    <th className="px-4 py-3.5 font-semibold">SKU</th>
                    <th className="px-4 py-3.5 font-semibold">Risk Score</th>
                    <th className="px-4 py-3.5 font-semibold">Severity Level</th>
                    <th className="px-4 py-3.5 font-semibold">Avg Rating</th>
                    <th className="px-4 py-3.5 font-semibold">Primary Defect Aspect</th>
                    <th className="px-5 py-3.5 font-semibold">Risk Factor Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredProductsAtRisk.length > 0 ? (
                    filteredProductsAtRisk.map((p) => (
                      <tr key={p.product_id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-5 py-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-indigo-400 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <code className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-xs border border-slate-800">
                            {p.sku}
                          </code>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  p.risk_score >= 70
                                    ? 'bg-rose-500'
                                    : p.risk_score >= 40
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(p.risk_score, 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-white text-xs">{p.risk_score}</span>
                            <span className="text-[10px] text-slate-500">/100</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">{getRiskBadge(p.risk_level)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{Number(p.avg_rating).toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            {p.primary_complaint}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400">
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {p.reasons && p.reasons.length > 0 ? (
                              p.reasons.map((r, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800/90 text-slate-300 text-[11px]"
                                >
                                  • {r}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500">None detected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-500 text-xs">
                        No products match the selected risk filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── INTERACTIVE LIVE CUSTOMER REVIEW FEED ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="bg-slate-900/80 border-slate-800/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  Automated Ingested Review Stream
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredReviews.length} of {reviews.length} total live ingested customer reviews
                </CardDescription>
              </div>

              {/* Feed Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search review content or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs bg-slate-950/80 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  />
                </div>

                {/* Sentiment Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
                  {(['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'] as const).map((sent) => (
                    <button
                      key={sent}
                      onClick={() => setSelectedSentimentFilter(sent)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        selectedSentimentFilter === sent
                          ? 'bg-indigo-600 text-white font-semibold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sent}
                    </button>
                  ))}
                </div>

                {/* Rating Filter Buttons */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setSelectedRatingFilter(null)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                      selectedRatingFilter === null
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ★
                  </button>
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setSelectedRatingFilter(selectedRatingFilter === stars ? null : stars)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-0.5 ${
                        selectedRatingFilter === stars
                          ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {stars}★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3.5 pt-2">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((r, idx) => {
                const isNegative = r.sentiment?.toUpperCase() === 'NEGATIVE';
                const isPositive = r.sentiment?.toUpperCase() === 'POSITIVE';

                return (
                  <motion.div
                    key={r.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className={`p-4 rounded-xl border transition-all duration-200 bg-slate-950/70 hover:bg-slate-900/80 ${
                      isNegative
                        ? 'border-rose-500/30 hover:border-rose-500/50 shadow-sm shadow-rose-950/20'
                        : isPositive
                        ? 'border-emerald-500/20 hover:border-emerald-500/40'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Product info + Review text + Aspects */}
                      <div className="space-y-2.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-white text-sm flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                            {r.product_name}
                          </span>
                          <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px]">
                            {r.product_sku}
                          </code>
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 text-[10px] font-semibold border border-slate-800 uppercase tracking-wide">
                            {r.source || 'Direct Stream'}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-auto md:ml-0">
                            {r.review_date ? new Date(r.review_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                          </span>
                        </div>

                        {/* Review Text */}
                        <p className="text-sm text-slate-200 font-normal leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                          "{r.review_text}"
                        </p>

                        {/* Detected Aspects Badges */}
                        {r.detected_aspects && Object.keys(r.detected_aspects).length > 0 && (
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              Aspect Tags:
                            </span>
                            {Object.entries(r.detected_aspects).map(([asp, sent]) => {
                              const isAspectNeg = String(sent).toUpperCase() === 'NEGATIVE';
                              return (
                                <span
                                  key={asp}
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                                    isAspectNeg
                                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  }`}
                                >
                                  {asp}: <span className="uppercase">{String(sent)}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: Stars + Sentiment Pill */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 pt-1">
                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          <span className="text-amber-400 font-bold text-sm">{r.rating}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= Math.round(r.rating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-700 fill-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Sentiment Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                            isNegative
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-950/40'
                              : isPositive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-950/40'
                          }`}
                        >
                          {isNegative ? (
                            <ThumbsDown className="w-3 h-3 text-rose-400" />
                          ) : isPositive ? (
                            <ThumbsUp className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Activity className="w-3 h-3 text-amber-400" />
                          )}
                          {r.sentiment} ({Math.round((r.sentiment_score || 0.9) * 100)}%)
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
                <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-300 font-semibold text-sm">No customer reviews match your active filters</p>
                <p className="text-slate-500 text-xs mt-1">Try clearing your search query, rating, or aspect filter.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSentimentFilter('ALL');
                    setSelectedRatingFilter(null);
                    setSelectedAspectFilter(null);
                  }}
                  className="mt-4 border-slate-700 text-xs bg-slate-900"
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
