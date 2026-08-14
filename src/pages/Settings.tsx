import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Building2, Shield, Bell, Palette,
  Camera, Mail, Phone, MapPin, Globe
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
import { useTheme, Theme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

export default function Settings() {
  const { theme: currentTheme, setTheme } = useTheme()
  const { user, updateUser } = useAuth()

  const [firstName, setFirstName] = useState(user?.first_name || 'Chinmay')
  const [lastName, setLastName] = useState(user?.last_name || 'R.')
  const [email, setEmail] = useState(user?.email || 'chinmay@retailmind.ai')
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210')
  const [location, setLocation] = useState(user?.location || 'Mumbai, India')

  const [saveFeedback, setSaveFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      if (user.first_name) setFirstName(user.first_name)
      if (user.last_name) setLastName(user.last_name)
      if (user.email) setEmail(user.email)
      if (user.phone) setPhone(user.phone)
      if (user.location) setLocation(user.location)
    }
  }, [user])

  const handleSaveProfile = () => {
    updateUser({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      location: location,
    })
    setSaveFeedback('Profile updated successfully!')
    setTimeout(() => setSaveFeedback(null), 3000)
  }

  const handleSaveSettings = () => {
    setSaveFeedback('Settings saved successfully!')
    setTimeout(() => setSaveFeedback(null), 3000)
  }

  const avatarInitials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'RM'

  return (
    <div className="page-container max-w-4xl">
      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start mb-6 overflow-x-auto">
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-1.5" /> Profile</TabsTrigger>
          <TabsTrigger value="organization"><Building2 className="w-4 h-4 mr-1.5" /> Organization</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-1.5" /> Security</TabsTrigger>
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
                    <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                      {avatarInitials}
                    </AvatarFallback>
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
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={user?.role || 'Admin'} disabled />
                  </div>
                </div>
                {saveFeedback && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-success font-medium bg-success-50 border border-success-200 p-2 rounded-lg">
                    ✅ {saveFeedback}
                  </motion.div>
                )}
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="cursor-pointer">Save Changes</Button>
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
                    { id: 'light', name: 'Light', preview: 'bg-white border-2 border-primary' },
                    { id: 'dark', name: 'Dark', preview: 'bg-gray-900 border-2 border-transparent' },
                    { id: 'system', name: 'System', preview: 'bg-gradient-to-r from-white to-gray-900 border-2 border-transparent' },
                  ].map((t) => {
                    const isActive = currentTheme === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as Theme)}
                        className={cn(
                          'p-4 rounded-xl border transition-all duration-200 text-center cursor-pointer',
                          isActive ? 'border-primary bg-primary/5 shadow-elevated ring-2 ring-primary/20' : 'border-gray-200 hover:border-primary/30'
                        )}
                      >
                        <div className={cn('w-full h-20 rounded-lg mb-3', t.preview)} />
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        {isActive && <Badge variant="default" className="mt-1">Active</Badge>}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
