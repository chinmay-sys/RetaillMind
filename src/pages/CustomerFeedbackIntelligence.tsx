import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const [dashRes, revRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/reviews/dashboard'),
        fetch('http://localhost:8000/api/v1/reviews/list?limit=10'),
      ]);

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setDashboard(dashData);
      }
      if (revRes.ok) {
        const revData = await revRes.json();
        setReviews(revData.reviews || []);
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
      await fetch('http://localhost:8000/api/v1/reviews/sync', { method: 'POST' });
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
      const res = await fetch('http://localhost:8000/api/v1/reviews/trigger-demo-event', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setDemoResult(data);
        await fetchMetrics();
      }
    } catch (e) {
      console.error('Demo simulation failed:', e);
    } finally {
      setDemoing(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'FRESH':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> FRESH (&lt;60m)</Badge>;
      case 'STALE':
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> STALE (1-6h)</Badge>;
      case 'CRITICAL':
        return <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5" /> CRITICAL (&gt;6h)</Badge>;
      default:
        return <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/30 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> UNAVAILABLE</Badge>;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/40">CRITICAL RISK</Badge>;
      case 'HIGH':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">HIGH RISK</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40">MEDIUM RISK</Badge>;
      default:
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">LOW RISK</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Customer Feedback Intelligence</h1>
              <p className="text-sm text-slate-400">Automated Review Streams, DistilBERT Sentiment, Aspect Detection & Decision Safety Gates</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(dashboard?.review_data_status || dashboard?.health?.status)}
          <Button
            onClick={handleManualSync}
            disabled={syncing}
            variant="outline"
            className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing Stream...' : 'Sync Reviews'}
          </Button>

          <Button
            onClick={handleSimulateDemoEvent}
            disabled={demoing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          >
            <Zap className={`w-4 h-4 mr-2 ${demoing ? 'animate-bounce' : ''}`} />
            Simulate Defect Review Event
          </Button>
        </div>
      </div>

      {/* Demo Event Trigger Banner */}
      {demoResult && (
        <Card className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-indigo-500/40 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-indigo-300 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Live End-to-End Automated Review Ingestion Demo Execution
              </CardTitle>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Pipeline Executed</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-900/70 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 text-xs block">Ingested Review text</span>
                <p className="text-slate-200 font-medium line-clamp-2">{demoResult.ingested_review?.review_text}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">DistilBERT Sentiment & Aspects</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-rose-500/20 text-rose-300">{demoResult.ingested_review?.sentiment}</Badge>
                  {Object.entries(demoResult.ingested_review?.detected_aspects || {}).map(([asp, s]) => (
                    <Badge key={asp} variant="outline" className="text-amber-300 border-amber-500/30">
                      {asp}: {String(s)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Orchestrator Safety Gate Action</span>
                <p className="text-rose-400 font-semibold mt-1">
                  {demoResult.orchestrated_decisions?.[0]?.title || 'Safety Gate Triggered'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Source Health Card */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Review Source Connector</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 font-semibold text-lg text-white truncate">
              {dashboard?.health?.source || 'DEMO REVIEW SOURCE'}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>
                Last Sync:{' '}
                {typeof dashboard?.health?.minutes_since_sync === 'number' && !isNaN(dashboard.health.minutes_since_sync)
                  ? `${dashboard.health.minutes_since_sync}m ago`
                  : 'N/A'}
              </span>
              <span>Interval: 15m</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Reviews Card */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Analyzed Reviews</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {dashboard?.total_reviews || 0}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Deduplicated in Postgres</span>
              <span className="text-emerald-400 font-medium">100% Validated</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating Card */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Average Customer Rating</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{dashboard?.avg_rating || '0.0'}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <div className="mt-3 flex items-center gap-1 border-t border-slate-800/80 pt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(dashboard?.avg_rating || 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Negative Sentiment Trend Card */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Negative Sentiment %</span>
              <ThumbsDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{dashboard?.negative_pct || 0}%</span>
              <span className={`text-xs font-medium flex items-center ${
                (dashboard?.negative_trend_7d || 0) >= 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {(dashboard?.negative_trend_7d || 0) >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {dashboard?.negative_trend_7d}% 7d
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Positive: {dashboard?.positive_pct || 0}%</span>
              <span>Neutral: {dashboard?.neutral_pct || 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment & Aspect Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Distribution Card */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Sentiment Distribution (DistilBERT)
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Pretrained Hugging Face transformer model classification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-emerald-400 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Positive</span>
                <span className="text-slate-300">{dashboard?.positive_pct || 0}%</span>
              </div>
              <Progress value={dashboard?.positive_pct || 0} className="h-2 bg-slate-800" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-amber-400">Neutral</span>
                <span className="text-slate-300">{dashboard?.neutral_pct || 0}%</span>
              </div>
              <Progress value={dashboard?.neutral_pct || 0} className="h-2 bg-slate-800" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-rose-400 flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Negative</span>
                <span className="text-slate-300">{dashboard?.negative_pct || 0}%</span>
              </div>
              <Progress value={dashboard?.negative_pct || 0} className="h-2 bg-slate-800" />
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400 mt-2">
              <span className="text-indigo-300 font-medium block mb-1">Safety Gate Rule:</span>
              High forecast demand with &gt;35% negative sentiment automatically puts reorders on <strong className="text-rose-400">HOLD</strong>.
            </div>
          </CardContent>
        </Card>

        {/* Top Aspect Complaints Card */}
        <Card className="bg-slate-900/60 border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Detected Aspect Complaints (NLP Aspect Extractor)
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Automatically identifies product defects across 11 key feature categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.top_complaints && dashboard.top_complaints.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dashboard.top_complaints.map((item) => (
                  <div key={item.aspect} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/90 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 text-sm">{item.aspect}</span>
                      <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30">{item.count} Neg</Badge>
                    </div>
                    <div className="mt-3 text-xs text-slate-400 flex justify-between items-center">
                      <span>Occurrences: {item.total}</span>
                      <span className="text-amber-400 font-medium">Defect Risk</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                No critical aspect complaints detected in customer review stream.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products at Risk Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Transparent Product Risk Scores
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Calculated using negative sentiment %, rating decline, aspect defect frequency, and review freshness penalty
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Avg Rating</th>
                <th className="px-4 py-3">Primary Issue</th>
                <th className="px-4 py-3">Transparent Reasons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dashboard?.products_at_risk && dashboard.products_at_risk.length > 0 ? (
                dashboard.products_at_risk.map((p) => (
                  <tr key={p.product_id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-white">{p.risk_score}</span>
                      <span className="text-xs text-slate-500"> / 100</span>
                    </td>
                    <td className="px-4 py-3">{getRiskBadge(p.risk_level)}</td>
                    <td className="px-4 py-3 font-semibold text-amber-400">{p.avg_rating} ⭐</td>
                    <td className="px-4 py-3 text-slate-200">{p.primary_complaint}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {p.reasons.join(' • ')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    No high-risk products identified.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Real-time Review Feed */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Automated Ingested Review Stream
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Deduplicated in PostgreSQL with real-time DistilBERT sentiment tags and aspect complaint badges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{r.product_name}</span>
                    <Badge variant="outline" className="text-slate-400 border-slate-700 text-xs">{r.product_sku}</Badge>
                    <Badge className="bg-slate-800 text-slate-300 text-xs">{r.source}</Badge>
                  </div>
                  <p className="text-sm text-slate-300 italic">"{r.review_text}"</p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {Object.entries(r.detected_aspects || {}).map(([asp, sent]) => (
                      <Badge
                        key={asp}
                        className={sent === 'NEGATIVE' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}
                      >
                        {asp}: {sent}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                    {r.rating} ⭐
                  </div>
                  <Badge className={r.sentiment === 'NEGATIVE' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}>
                    {r.sentiment} ({Math.round(r.sentiment_score * 100)}%)
                  </Badge>
                  <span className="text-xs text-slate-500">{new Date(r.review_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              No review records found in database stream.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
