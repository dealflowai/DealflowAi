import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Play, Pause, Settings } from "lucide-react";

interface ScrapingPreference {
  id: string;
  platform: string;
  auto_scrape_enabled: boolean;
  scrape_frequency_hours: number;
  last_scrape_at?: string;
  next_scrape_at?: string;
  scrape_count: number;
  facebook_groups?: string[];
  linkedin_groups?: string[];
  propwire_categories?: string[];
}

export const AutomatedScrapingManager = () => {
  const [preferences, setPreferences] = useState<ScrapingPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_preferences')
        .select('*')
        .order('platform');

      if (error) throw error;
      setPreferences(data || []);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load scraping preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (id: string, updates: Partial<ScrapingPreference>) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('scraping_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setPreferences(prev => 
        prev.map(pref => 
          pref.id === id ? { ...pref, ...updates } : pref
        )
      );

      toast({
        title: "Success",
        description: "Automated scraping settings updated",
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const toggleAutomation = async (id: string, enabled: boolean) => {
    const nextScrapeAt = enabled 
      ? new Date(Date.now() + 60 * 60 * 1000).toISOString() // Next hour
      : null;

    await updatePreference(id, {
      auto_scrape_enabled: enabled,
      next_scrape_at: nextScrapeAt
    });
  };

  const updateFrequency = async (id: string, hours: number) => {
    const pref = preferences.find(p => p.id === id);
    if (!pref) return;

    const nextScrapeAt = pref.auto_scrape_enabled
      ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
      : pref.next_scrape_at;

    await updatePreference(id, {
      scrape_frequency_hours: hours,
      next_scrape_at: nextScrapeAt
    });
  };

  const runNow = async (id: string) => {
    setUpdating(id);
    try {
      const { data, error } = await supabase.functions.invoke('automated-scraper', {
        body: { force_run: id }
      });

      if (error) throw error;

      toast({
        title: "Scraper Started",
        description: "Manual scrape initiated successfully",
      });

      // Reload preferences to get updated times
      setTimeout(loadPreferences, 1000);
    } catch (error) {
      console.error('Error running scraper:', error);
      toast({
        title: "Error",
        description: "Failed to start manual scrape",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (pref: ScrapingPreference) => {
    if (!pref.auto_scrape_enabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    
    const nextScrape = pref.next_scrape_at ? new Date(pref.next_scrape_at) : null;
    const now = new Date();
    
    if (nextScrape && nextScrape <= now) {
      return <Badge variant="default">Ready</Badge>;
    }
    
    return <Badge variant="outline">Scheduled</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Automated Scraping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Automated Scraping
        </CardTitle>
        <CardDescription>
          Schedule automatic scraping of your configured platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {preferences.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No scraping preferences configured. Set up your platforms first.
          </div>
        ) : (
          preferences.map((pref) => (
            <div key={pref.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold capitalize">{pref.platform}</h3>
                  {getStatusBadge(pref)}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={pref.auto_scrape_enabled}
                    onCheckedChange={(enabled) => toggleAutomation(pref.id, enabled)}
                    disabled={updating === pref.id}
                  />
                  <Label htmlFor={`auto-${pref.id}`}>Auto-scrape</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={pref.scrape_frequency_hours.toString()}
                    onValueChange={(value) => updateFrequency(pref.id, parseInt(value))}
                    disabled={updating === pref.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every Hour</SelectItem>
                      <SelectItem value="6">Every 6 Hours</SelectItem>
                      <SelectItem value="12">Every 12 Hours</SelectItem>
                      <SelectItem value="24">Daily</SelectItem>
                      <SelectItem value="48">Every 2 Days</SelectItem>
                      <SelectItem value="72">Every 3 Days</SelectItem>
                      <SelectItem value="168">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Manual Control</Label>
                  <Button
                    onClick={() => runNow(pref.id)}
                    disabled={updating === pref.id}
                    size="sm"
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Now
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <strong>Last Run:</strong>
                  <br />
                  {formatDate(pref.last_scrape_at)}
                </div>
                <div>
                  <strong>Next Run:</strong>
                  <br />
                  {formatDate(pref.next_scrape_at)}
                </div>
                <div>
                  <strong>Total Runs:</strong>
                  <br />
                  {pref.scrape_count || 0}
                </div>
              </div>

              {pref.auto_scrape_enabled && (
                <div className="bg-muted rounded p-3 text-sm">
                  <p className="font-medium mb-1">Configured Targets:</p>
                  <div className="flex flex-wrap gap-1">
                    {pref.facebook_groups?.map(group => (
                      <Badge key={group} variant="outline" className="text-xs">FB: {group}</Badge>
                    ))}
                    {pref.linkedin_groups?.map(group => (
                      <Badge key={group} variant="outline" className="text-xs">LI: {group}</Badge>
                    ))}
                    {pref.propwire_categories?.map(cat => (
                      <Badge key={cat} variant="outline" className="text-xs">PW: {cat}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Automated Scraping Info
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Cron jobs run every hour to check for scheduled scrapes. Make sure you have active browser sessions 
                for your platforms. Notifications will be sent when scrapes complete.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};