import { motion } from 'framer-motion'
import { FileText, Download, Calendar, Clock, Eye, FileSpreadsheet, File, Loader2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { reports } from '@/data/mockData'
import { cn } from '@/lib/utils'

const typeConfig = {
  weekly: { label: 'Weekly', color: 'bg-primary/10 text-primary', icon: Calendar },
  monthly: { label: 'Monthly', color: 'bg-secondary/10 text-secondary', icon: Calendar },
  executive: { label: 'Executive', color: 'bg-accent/10 text-accent', icon: FileText },
}

export default function Reports() {
  return (
    <div className="page-container">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Reports Generated', value: '47', description: 'This quarter', icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Last Generated', value: '2h ago', description: 'Weekly Performance', icon: Clock, color: 'text-secondary', bg: 'bg-secondary/10' },
          { title: 'Scheduled Reports', value: '3', description: 'Active schedules', icon: Calendar, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl', stat.bg)}><stat.icon className={cn('w-5 h-5', stat.color)} /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-3">
        <Button>
          <FileText className="w-4 h-4" /> Generate Weekly Report
        </Button>
        <Button variant="secondary">
          <FileText className="w-4 h-4" /> Generate Monthly Report
        </Button>
        <Button variant="outline">
          <FileText className="w-4 h-4" /> Executive Summary
        </Button>
      </motion.div>

      {/* Reports List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report History</CardTitle>
            <CardDescription>View and download previously generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report, i) => {
                const config = typeConfig[report.type]
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="p-4 rounded-xl border border-gray-100 hover:border-primary/20 transition-all duration-200 hover:shadow-soft"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2.5 rounded-xl shrink-0', config.color)}>
                          <config.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{report.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted">{report.date}</span>
                            <span className="text-xs text-muted">•</span>
                            <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
                            {report.status === 'ready' ? (
                              <Badge variant="success" className="text-[10px]">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                              </Badge>
                            ) : (
                              <Badge variant="warning" className="text-[10px]">
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating
                              </Badge>
                            )}
                          </div>
                          {report.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {report.highlights.map((h, j) => (
                                <span key={j} className="text-[10px] px-2 py-0.5 bg-gray-50 rounded-md text-muted">
                                  {h}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {report.status === 'ready' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="ghost" size="icon-sm"><Eye className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm">
                            <File className="w-3.5 h-3.5" /> PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
