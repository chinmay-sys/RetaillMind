import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Building2, Shield, Key, Bell, Palette,
  Camera, Mail, Phone, MapPin, Globe, Copy, Eye, EyeOff, Plus, Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const apiKeys = [
  { id: 1, name: 'Production API Key', key: 'rm_live_****4f8b', created: 'Jan 15, 2026', lastUsed: '2 hours ago', status: 'active' },
  { id: 2, name: 'Development API Key', key: 'rm_test_****9a2c', created: 'Jan 20, 2026', lastUsed: '5 days ago', status: 'active' },
]

export default function Settings() {
  const [showKey, setShowKey] = useState<number | null>(null)
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null)

  const handleSaveSettings = () => {
    setSaveFeedback('Settings saved successfully!')
    setTimeout(() => setSaveFeedback(null), 3000)
  }

  return (
    <div className="page-container max-w-4xl">
      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start mb-6 overflow-x-auto">
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-1.5" /> Profile</TabsTrigger>
          <TabsTrigger value="organization"><Building2 className="w-4 h-4 mr-1.5" /> Organization</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-1.5" /> Security</TabsTrigger>
          <TabsTrigger value="api-keys"><Key className="w-4 h-4 mr-1.5" /> API Keys</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="theme"><Palette className="w-4 h-4 mr-1.5" /> Theme</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Information</CardTitle>
                <CardDescription>Manage your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-secondary text-white">CR</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm"><Camera className="w-4 h-4" /> Change Avatar</Button>
                    <p className="text-xs text-muted mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue="Chinmay" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="R." />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <Input defaultValue="chinmay@retailmind.ai" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <Input defaultValue="+91 98765 43210" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <Input defaultValue="Mumbai, India" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input defaultValue="Admin" disabled />
                  </div>
                </div>
                {saveFeedback && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-success font-medium bg-success-50 border border-success-200 p-2 rounded-lg">
                    ✅ {saveFeedback}
                  </motion.div>
                )}
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} className="cursor-pointer">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Organization */}
        <TabsContent value="organization">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization Settings</CardTitle>
                <CardDescription>Manage your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input defaultValue="RetailMind AI" />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input defaultValue="Retail & E-commerce" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <Input defaultValue="www.retailmind.ai" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Input defaultValue="25-50 employees" />
                  </div>
                </div>
                <div className="flex justify-end"><Button onClick={handleSaveSettings} className="cursor-pointer">Save Changes</Button></div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="Min. 8 characters" /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="Repeat new password" /></div>
                <div className="flex justify-end"><Button>Update Password</Button></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable 2FA</p>
                    <p className="text-xs text-muted">Require a verification code on each login</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api-keys">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">API Keys</CardTitle>
                  <CardDescription>Manage your API keys for programmatic access</CardDescription>
                </div>
                <Button size="sm"><Plus className="w-4 h-4" /> Generate Key</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{apiKey.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs font-mono bg-gray-50 px-2 py-0.5 rounded text-muted">
                            {showKey === apiKey.id ? 'rm_live_sk_a1b2c3d4e5f6g7h84f8b' : apiKey.key}
                          </code>
                          <button onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)} className="text-muted hover:text-foreground">
                            {showKey === apiKey.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button className="text-muted hover:text-foreground"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                        <p className="text-[10px] text-muted mt-1">Created {apiKey.created} • Last used {apiKey.lastUsed}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success">{apiKey.status}</Badge>
                        <Button variant="ghost" size="icon-sm" className="text-danger"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription>Choose how and when you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: 'Low Stock Alerts', description: 'Get notified when products fall below safety stock', defaultChecked: true },
                  { title: 'Price Change Alerts', description: 'Competitor price changes and AI pricing suggestions', defaultChecked: true },
                  { title: 'Forecast Updates', description: 'New demand forecast model updates and accuracy reports', defaultChecked: true },
                  { title: 'Supplier Delays', description: 'Notifications about supplier delivery delays', defaultChecked: true },
                  { title: 'AI Recommendations', description: 'Strategic recommendations from the AI Decision Engine', defaultChecked: true },
                  { title: 'Weekly Reports', description: 'Automated weekly performance summary emails', defaultChecked: false },
                  { title: 'Marketing Updates', description: 'Product updates, tips, and feature announcements', defaultChecked: false },
                ].map((pref) => (
                  <div key={pref.title} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{pref.title}</p>
                      <p className="text-xs text-muted">{pref.description}</p>
                    </div>
                    <Switch defaultChecked={pref.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Theme */}
        <TabsContent value="theme">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Theme Settings</CardTitle>
                <CardDescription>Customize the look and feel of your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { name: 'Light', active: true, preview: 'bg-white border-2 border-primary' },
                    { name: 'Dark', active: false, preview: 'bg-gray-900 border-2 border-transparent' },
                    { name: 'System', active: false, preview: 'bg-gradient-to-r from-white to-gray-900 border-2 border-transparent' },
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      className={cn(
                        'p-4 rounded-xl border transition-all duration-200 text-center',
                        theme.active ? 'border-primary bg-primary/5 shadow-elevated' : 'border-gray-200 hover:border-primary/30'
                      )}
                    >
                      <div className={cn('w-full h-20 rounded-lg mb-3', theme.preview)} />
                      <p className="text-sm font-medium text-foreground">{theme.name}</p>
                      {theme.active && <Badge variant="default" className="mt-1">Active</Badge>}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
