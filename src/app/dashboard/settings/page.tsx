'use client';

import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      <Header
        title="Settings"
        subtitle="Manage your preferences and account"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Section */}
        <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
          <CardHeader>
            <CardTitle className="text-[#e1e3e4]">Profile</CardTitle>
            <CardDescription className="text-[#ccc3d8]">Personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#7c3aed]/20 text-[#d2bbff]">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name ?? 'User'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-[#e1e3e4] truncate">{user?.name ?? 'User'}</h3>
                <p className="text-sm text-[#ccc3d8] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 text-xs">
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Change Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
          <CardHeader>
            <CardTitle className="text-[#e1e3e4]">Appearance</CardTitle>
            <CardDescription className="text-[#ccc3d8]">Visual preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e1e3e4]">Theme</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-9 flex-1">
                  Light
                </Button>
                <Button size="sm" className="h-9 flex-1 bg-[#7c3aed]">
                  Dark
                </Button>
              </div>
              <p className="text-xs text-[#ccc3d8]">
                Currently using Dark mode (System default)
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e1e3e4]">Font Size</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-9">
                  Small
                </Button>
                <Button size="sm" className="h-9">
                  Medium
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  Large
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
          <CardHeader>
            <CardTitle className="text-[#e1e3e4]">Notifications</CardTitle>
            <CardDescription className="text-[#ccc3d8]">How you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Email notifications', description: 'Receive updates via email', enabled: true },
              { label: 'Document analysis alerts', description: 'When documents are processed', enabled: true },
              { label: 'Weekly summaries', description: 'Monthly usage reports', enabled: false },
              { label: 'Security alerts', description: 'Login from new devices', enabled: true },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-[#e1e3e4]">{item.label}</p>
                  <p className="text-xs text-[#ccc3d8]">{item.description}</p>
                </div>
                <div className="flex h-6 w-11 items-center rounded-full bg-[#7c3aed] px-1">
                  <div
                    className={`h-4 w-4 rounded-full bg-white transition-all ${
                      item.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
          <CardHeader>
            <CardTitle className="text-[#e1e3e4]">Preferences</CardTitle>
            <CardDescription className="text-[#ccc3d8]">App settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e1e3e4]">Language</label>
              <div className="flex items-center gap-2">
                <Icon name="Globe" size={16} className="text-[#ccc3d8]" />
                <select className="flex-1 rounded-md border border-[#958da1]/30 bg-[#0c0f10] px-3 py-2 text-sm text-[#e1e3e4] focus:border-[#7c3aed] focus:outline-none">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e1e3e4]">Default AI Model</label>
              <div className="flex items-center gap-2">
                <Icon name="BrainCircuit" size={16} className="text-[#ccc3d8]" />
                <select className="flex-1 rounded-md border border-[#958da1]/30 bg-[#0c0f10] px-3 py-2 text-sm text-[#e1e3e4] focus:border-[#7c3aed] focus:outline-none">
                  <option>GPT-4 Turbo</option>
                  <option>Claude 3 Opus</option>
                  <option>Llama 3 70B</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan & Usage Section */}
        <Card className="md:col-span-2 bg-[#1d2021]/50 border-[#958da1]/20">
          <CardHeader>
            <CardTitle className="text-[#e1e3e4]">Plan & Usage</CardTitle>
            <CardDescription className="text-[#ccc3d8]">Your current subscription and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg bg-[#0c0f10] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#d2bbff]">
                  <Icon name="Star" size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-[#e1e3e4]">Premium Plan</h4>
                  <p className="text-sm text-[#ccc3d8]">Unlimited documents and AI queries</p>
                </div>
              </div>
              <Button variant="outline" className="h-9 px-4 text-sm">
                Manage Plan
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#ccc3d8]">Storage</span>
                  <span className="text-[#e1e3e4]">2.4 GB / 5 GB used</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#0c0f10]">
                  <div className="h-full w-[48%] rounded-full bg-[#7c3aed]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#ccc3d8]">AI Queries</span>
                  <span className="text-[#e1e3e4]">840 / 1000 used</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#0c0f10]">
                  <div className="h-full w-[84%] rounded-full bg-[#d2bbff]" />
                </div>
              </div>
            </div>

            <Button className="w-full" asChild>
              <a href="#">Upgrade to Premium</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
