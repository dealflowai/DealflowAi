
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  Phone, 
  Mail, 
  MessageSquare, 
  Zap, 
  PlayCircle, 
  PauseCircle, 
  StopCircle,
  Settings, 
  Target, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Mic,
  Send,
  Calendar,
  BarChart3,
  Sparkles,
  BrainCircuit,
  Volume2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";

interface Buyer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  priority: string | null;
  budget_min: number | null;
  budget_max: number | null;
  investment_criteria: string | null;
  notes: string | null;
}

interface OutreachCampaign {
  id: string;
  name: string;
  type: 'qualification' | 'follow_up' | 'nurture' | 'conversion';
  channel: 'voice' | 'sms' | 'email' | 'multi_channel';
  status: 'draft' | 'active' | 'paused' | 'completed';
  target_count: number;
  contacted_count: number;
  response_rate: number;
  conversion_rate: number;
  ai_agent_config: {
    persona: string;
    objectives: string[];
    qualification_criteria: string[];
    fallback_actions: string[];
  };
  created_at: string;
  updated_at: string;
}

interface OutreachActivity {
  id: string;
  buyer_id: string;
  campaign_id: string;
  channel: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  ai_analysis: {
    qualification_score: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    key_insights: string[];
    next_actions: string[];
  };
  transcript?: string;
  response_data?: any;
  scheduled_at: string;
  completed_at?: string;
}

interface AIOutreachProps {
  buyers: Buyer[];
  onRefresh: () => void;
}

const AIOutreach = ({ buyers, onRefresh }: AIOutreachProps) => {
  const { user } = useUser();
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
  const [activities, setActivities] = useState<OutreachActivity[]>([]);
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState<'qualification' | 'follow_up' | 'nurture' | 'conversion'>('qualification');
  const [communicationChannel, setCommunicationChannel] = useState<'voice' | 'sms' | 'email' | 'multi_channel'>('email');
  const [aiPersona, setAiPersona] = useState("");
  const [qualificationCriteria, setQualificationCriteria] = useState("");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [realTimeStats, setRealTimeStats] = useState({
    activeOutreach: 0,
    todayContacts: 0,
    responseRate: 0,
    qualifiedLeads: 0
  });

  // Load campaigns and activities
  useEffect(() => {
    loadCampaigns();
    loadActivities();
    loadRealTimeStats();
  }, [user?.id]);

  const loadCampaigns = async () => {
    // Mock data - replace with actual Supabase queries
    const mockCampaigns: OutreachCampaign[] = [
      {
        id: "1",
        name: "Q1 Buyer Qualification Campaign",
        type: "qualification",
        channel: "voice",
        status: "active",
        target_count: 50,
        contacted_count: 23,
        response_rate: 68,
        conversion_rate: 34,
        ai_agent_config: {
          persona: "Professional real estate investment consultant",
          objectives: ["Qualify investment budget", "Understand timeline", "Assess deal preferences"],
          qualification_criteria: ["Minimum $50K budget", "Ready to invest within 6 months", "Previous investment experience"],
          fallback_actions: ["Schedule follow-up call", "Send information packet", "Add to nurture sequence"]
        },
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-20T15:30:00Z"
      },
      {
        id: "2",
        name: "High-Value Investor Nurture",
        type: "nurture",
        channel: "multi_channel",
        status: "active",
        target_count: 25,
        contacted_count: 25,
        response_rate: 84,
        conversion_rate: 56,
        ai_agent_config: {
          persona: "Senior investment advisor",
          objectives: ["Build relationship", "Share market insights", "Present premium opportunities"],
          qualification_criteria: ["$250K+ budget", "Portfolio investor", "Quick decision maker"],
          fallback_actions: ["Send market report", "Invite to exclusive webinar", "Personal consultation offer"]
        },
        created_at: "2024-01-10T08:00:00Z",
        updated_at: "2024-01-21T11:45:00Z"
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const loadActivities = async () => {
    // Mock recent activities
    const mockActivities: OutreachActivity[] = [
      {
        id: "1",
        buyer_id: "buyer_1",
        campaign_id: "1",
        channel: "voice",
        status: "completed",
        ai_analysis: {
          qualification_score: 87,
          sentiment: "positive",
          key_insights: ["Experienced investor", "Looking for fix-and-flip opportunities", "Budget range $100K-$300K"],
          next_actions: ["Send deal examples", "Schedule property tour", "Add to VIP list"]
        },
        transcript: "AI: Hello, this is Sarah from Premium Investment Properties. I'm calling to discuss your real estate investment interests...",
        scheduled_at: "2024-01-21T14:00:00Z",
        completed_at: "2024-01-21T14:12:00Z"
      }
    ];
    setActivities(mockActivities);
  };

  const loadRealTimeStats = async () => {
    setRealTimeStats({
      activeOutreach: 3,
      todayContacts: 12,
      responseRate: 76,
      qualifiedLeads: 8
    });
  };

  const createCampaign = async () => {
    if (!campaignName.trim() || selectedBuyers.length === 0) {
      toast.error("Please provide campaign name and select buyers");
      return;
    }

    setIsCreatingCampaign(true);
    
    try {
      // Simulate campaign creation
      const newCampaign: OutreachCampaign = {
        id: Date.now().toString(),
        name: campaignName,
        type: campaignType,
        channel: communicationChannel,
        status: 'draft',
        target_count: selectedBuyers.length,
        contacted_count: 0,
        response_rate: 0,
        conversion_rate: 0,
        ai_agent_config: {
          persona: aiPersona || "Professional real estate consultant",
          objectives: ["Qualify investment interests", "Assess buying timeline", "Understand investment criteria"],
          qualification_criteria: qualificationCriteria.split('\n').filter(c => c.trim()),
          fallback_actions: ["Schedule follow-up", "Send information", "Add to nurture sequence"]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      
      // Reset form
      setCampaignName("");
      setSelectedBuyers([]);
      setAiPersona("");
      setQualificationCriteria("");
      
      toast.success(`Campaign "${newCampaign.name}" created successfully!`);
    } catch (error) {
      toast.error("Failed to create campaign");
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const startCampaign = async (campaignId: string) => {
    try {
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId ? { ...c, status: 'active' as const } : c
      ));
      setActiveCampaignId(campaignId);
      toast.success("Campaign started! AI agents are now reaching out to buyers.");
      
      // Simulate progressive outreach
      simulateOutreachProgress(campaignId);
    } catch (error) {
      toast.error("Failed to start campaign");
    }
  };

  const simulateOutreachProgress = (campaignId: string) => {
    const interval = setInterval(() => {
      setCampaigns(prev => prev.map(campaign => {
        if (campaign.id === campaignId && campaign.contacted_count < campaign.target_count) {
          const newContactedCount = Math.min(campaign.contacted_count + 1, campaign.target_count);
          const newResponseRate = Math.floor(Math.random() * 20) + 60; // 60-80%
          const newConversionRate = Math.floor(Math.random() * 30) + 20; // 20-50%
          
          return {
            ...campaign,
            contacted_count: newContactedCount,
            response_rate: newResponseRate,
            conversion_rate: newConversionRate
          };
        }
        return campaign;
      }));
    }, 3000);

    // Stop after reaching target
    setTimeout(() => {
      clearInterval(interval);
      setActiveCampaignId(null);
    }, 30000);
  };

  const pauseCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, status: 'paused' as const } : c
    ));
    setActiveCampaignId(null);
    toast.info("Campaign paused");
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'voice': return <Phone className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'multi_channel': return <Target className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Outreach Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI-Powered Buyer Outreach
              </span>
              <div className="text-sm text-gray-600 font-normal">
                LangChain agents with multi-channel communication (Voice, SMS, Email)
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Real-time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Outreach</p>
                    <p className="text-2xl font-bold">{realTimeStats.activeOutreach}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Today's Contacts</p>
                    <p className="text-2xl font-bold">{realTimeStats.todayContacts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="text-2xl font-bold">{realTimeStats.responseRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Qualified Leads</p>
                    <p className="text-2xl font-bold">{realTimeStats.qualifiedLeads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="create">Create Campaign</TabsTrigger>
              <TabsTrigger value="activities">Live Activities</TabsTrigger>
              <TabsTrigger value="ai-config">AI Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-6 mt-6">
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            {getChannelIcon(campaign.channel)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{campaign.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(campaign.status)}>
                                {campaign.status}
                              </Badge>
                              <Badge variant="outline">{campaign.type}</Badge>
                              <Badge variant="outline">{campaign.channel}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {campaign.status === 'draft' && (
                            <Button onClick={() => startCampaign(campaign.id)} size="sm">
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Start
                            </Button>
                          )}
                          {campaign.status === 'active' && (
                            <Button onClick={() => pauseCampaign(campaign.id)} variant="outline" size="sm">
                              <PauseCircle className="h-4 w-4 mr-2" />
                              Pause
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <p className="text-lg font-semibold">{campaign.contacted_count}/{campaign.target_count}</p>
                          <Progress value={(campaign.contacted_count / campaign.target_count) * 100} className="h-2 mt-1" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Response Rate</p>
                          <p className="text-lg font-semibold text-green-600">{campaign.response_rate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Conversion Rate</p>
                          <p className="text-lg font-semibold text-blue-600">{campaign.conversion_rate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">AI Persona</p>
                          <p className="text-sm font-medium truncate">{campaign.ai_agent_config.persona}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">AI Agent Objectives:</h4>
                        <div className="flex flex-wrap gap-2">
                          {campaign.ai_agent_config.objectives.map((objective, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {objective}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {campaigns.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                      <p className="text-gray-600 mb-4">Create your first AI outreach campaign to start qualifying buyers</p>
                      <Button>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create AI Outreach Campaign</CardTitle>
                  <CardDescription>
                    Set up intelligent buyer qualification and outreach using AI agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campaign-name">Campaign Name</Label>
                      <Input
                        id="campaign-name"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Q1 Buyer Qualification Campaign"
                      />
                    </div>
                    <div>
                      <Label htmlFor="campaign-type">Campaign Type</Label>
                      <Select value={campaignType} onValueChange={(value: any) => setCampaignType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="qualification">Buyer Qualification</SelectItem>
                          <SelectItem value="follow_up">Follow-up Sequence</SelectItem>
                          <SelectItem value="nurture">Lead Nurturing</SelectItem>
                          <SelectItem value="conversion">Conversion Campaign</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="communication-channel">Communication Channel</Label>
                    <Select value={communicationChannel} onValueChange={(value: any) => setCommunicationChannel(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voice">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>Voice Calls (ElevenLabs AI)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>SMS Messages (Twilio)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="email">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Email Outreach (SendGrid)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="multi_channel">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4" />
                            <span>Multi-Channel (All)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ai-persona">AI Agent Persona</Label>
                    <Textarea
                      id="ai-persona"
                      value={aiPersona}
                      onChange={(e) => setAiPersona(e.target.value)}
                      placeholder="Professional real estate investment consultant with 10+ years of experience..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="qualification-criteria">Qualification Criteria (one per line)</Label>
                    <Textarea
                      id="qualification-criteria"
                      value={qualificationCriteria}
                      onChange={(e) => setQualificationCriteria(e.target.value)}
                      placeholder={`Minimum $50K investment budget\nReady to invest within 6 months\nPrevious real estate investment experience\nLooking for specific property types`}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Select Target Buyers ({selectedBuyers.length} selected)</Label>
                    <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
                      {buyers.slice(0, 10).map((buyer) => (
                        <div key={buyer.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedBuyers.includes(buyer.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBuyers([...selectedBuyers, buyer.id]);
                              } else {
                                setSelectedBuyers(selectedBuyers.filter(id => id !== buyer.id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{buyer.name || 'Unnamed Buyer'}</p>
                            <p className="text-sm text-gray-500">
                              {buyer.email} • {buyer.phone} • Priority: {buyer.priority || 'Medium'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={createCampaign}
                    disabled={isCreatingCampaign}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    size="lg"
                  >
                    {isCreatingCampaign ? (
                      <>
                        <Bot className="h-5 w-5 mr-2 animate-pulse" />
                        Creating AI Campaign...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Create AI Campaign
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Live Outreach Activities</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time monitoring of AI agent interactions and buyer responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <Card key={activity.id} className="border-l-4 border-l-purple-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getChannelIcon(activity.channel)}
                                <Badge className={activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                  {activity.status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {new Date(activity.scheduled_at).toLocaleString()}
                                </span>
                              </div>
                              <Badge variant="outline">
                                Score: {activity.ai_analysis.qualification_score}%
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">AI Analysis</h4>
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    <span className="font-medium">Sentiment:</span> 
                                    <Badge variant="outline" className={`ml-2 ${
                                      activity.ai_analysis.sentiment === 'positive' ? 'text-green-700' : 
                                      activity.ai_analysis.sentiment === 'negative' ? 'text-red-700' : 'text-yellow-700'
                                    }`}>
                                      {activity.ai_analysis.sentiment}
                                    </Badge>
                                  </p>
                                  <div>
                                    <p className="font-medium text-sm">Key Insights:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {activity.ai_analysis.key_insights.map((insight, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {insight}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Recommended Actions</h4>
                                <div className="space-y-1">
                                  {activity.ai_analysis.next_actions.map((action, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-sm">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      <span>{action}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {activity.transcript && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center space-x-2">
                                  <Volume2 className="h-4 w-4" />
                                  <span>Conversation Transcript</span>
                                </h4>
                                <p className="text-sm text-gray-700 line-clamp-3">
                                  {activity.transcript}
                                </p>
                                <Button variant="link" size="sm" className="p-0 mt-2">
                                  View Full Transcript
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No active outreach</h3>
                      <p className="text-gray-600">Start a campaign to see live AI interactions here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-config" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>AI Agent Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Configure LangChain agents and communication channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Mic className="h-5 w-5" />
                          <span>Voice AI (ElevenLabs)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Voice Model</Label>
                          <Select defaultValue="eleven_multilingual_v2">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eleven_multilingual_v2">Multilingual v2</SelectItem>
                              <SelectItem value="eleven_turbo_v2_5">Turbo v2.5</SelectItem>
                              <SelectItem value="eleven_turbo_v2">Turbo v2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Voice Character</Label>
                          <Select defaultValue="sarah">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sarah">Sarah (Professional)</SelectItem>
                              <SelectItem value="alice">Alice (Friendly)</SelectItem>
                              <SelectItem value="charlotte">Charlotte (Confident)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Enable Voice Outreach</Label>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <MessageSquare className="h-5 w-5" />
                          <span>SMS (Twilio)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>SMS Template Style</Label>
                          <Select defaultValue="professional">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="casual">Casual & Friendly</SelectItem>
                              <SelectItem value="direct">Direct & Concise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Daily SMS Limit</Label>
                          <Select defaultValue="50">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="25">25 messages</SelectItem>
                              <SelectItem value="50">50 messages</SelectItem>
                              <SelectItem value="100">100 messages</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Enable SMS Outreach</Label>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <BrainCircuit className="h-5 w-5" />
                        <span>LangChain Agent Settings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Primary Language Model</Label>
                        <Select defaultValue="gpt-4-turbo">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Agent Memory Type</Label>
                        <Select defaultValue="conversation_buffer_window">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conversation_buffer_window">Buffer Window</SelectItem>
                            <SelectItem value="conversation_summary">Summary Memory</SelectItem>
                            <SelectItem value="conversation_token_buffer">Token Buffer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <Label>Auto-qualification</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Sentiment Analysis</Label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIOutreach;
