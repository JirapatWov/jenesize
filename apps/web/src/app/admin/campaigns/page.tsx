'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, ExternalLink, Trash2, Edit } from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    utmCampaign: '',
    utmSource: 'website',
    utmMedium: 'affiliate',
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns(true);
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      await api.createCampaign(formData);
      setFormData({
        name: '',
        description: '',
        utmCampaign: '',
        utmSource: 'website',
        utmMedium: 'affiliate',
      });
      setShowAddForm(false);
      loadCampaigns();
    } catch (error: any) {
      alert(error.message || 'Failed to create campaign');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await api.deleteCampaign(id);
      loadCampaigns();
    } catch (error: any) {
      alert(error.message || 'Failed to delete campaign');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground">
            Manage your marketing campaigns and affiliate links
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Add Campaign Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCampaign} className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  placeholder="Summer Deal 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Hot deals for summer!"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="utmCampaign">UTM Campaign</Label>
                  <Input
                    id="utmCampaign"
                    placeholder="summer2025"
                    value={formData.utmCampaign}
                    onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="utmSource">UTM Source</Label>
                  <Input
                    id="utmSource"
                    placeholder="website"
                    value={formData.utmSource}
                    onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="utmMedium">UTM Medium</Label>
                  <Input
                    id="utmMedium"
                    placeholder="affiliate"
                    value={formData.utmMedium}
                    onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={adding}>
                  {adding ? 'Creating...' : 'Create Campaign'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                      {campaign.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{campaign.linksCount} links</span>
                    <span>•</span>
                    <span>Slug: {campaign.slug}</span>
                    <span>•</span>
                    <span>Created: {formatDate(campaign.createdAt)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <Badge variant="outline">utm_campaign={campaign.utmCampaign}</Badge>
                    {campaign.utmSource && (
                      <Badge variant="outline">utm_source={campaign.utmSource}</Badge>
                    )}
                    {campaign.utmMedium && (
                      <Badge variant="outline">utm_medium={campaign.utmMedium}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/campaigns/${campaign.id}`}>
                    <Button size="sm" variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                  </Link>
                  <Link href={`/campaigns/${campaign.slug}`} target="_blank">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No campaigns yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first campaign to get started
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Megaphone({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
}

