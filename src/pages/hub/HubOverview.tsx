import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  Clock, 
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

const kpiData = [
  { title: "Revenue Today", value: "$4,250", change: "+12.5%", isPositive: true, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "Upcoming Bookings", value: "24", change: "+4", isPositive: true, icon: CalendarCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "Active Leads", value: "156", change: "+18%", isPositive: true, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  { title: "Pending Follow-ups", value: "12", change: "-2", isPositive: false, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const activityFeed = [
  { id: 1, type: "booking", message: "New booking for Sunset Catamaran", user: "John Doe", time: "10 mins ago" },
  { id: 2, type: "lead", message: "VIP Lead assigned to Maria", user: "System", time: "25 mins ago" },
  { id: 3, type: "payment", message: "Payment received for Volcano Tour", user: "Alice Smith", time: "1 hour ago" },
  { id: 4, type: "alert", message: "Low capacity on Friday Surf Lesson", user: "AI Assistant", time: "2 hours ago" },
];

export function HubOverview() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-2 font-medium">Your operational command center.</p>
        </div>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-border shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Updates</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 rounded-[24px] border border-border/50 bg-card/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.change}
                </div>
              </div>
              <h3 className="text-muted-foreground font-medium text-sm mb-1">{kpi.title}</h3>
              <p className="text-3xl font-black text-foreground tracking-tight">{kpi.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Center Section: Charts & Operations */}
        <div className="space-y-8">
          <Card className="p-8 rounded-[32px] border border-border/50 bg-card/50 backdrop-blur-xl shadow-lg min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <BarChart3 className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">Revenue Graph Visualization Area</p>
            <p className="text-xs text-muted-foreground/50 mt-2">Integrate charting library here</p>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
             <Card className="p-6 rounded-[24px] border border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-primary" /> Upcoming Operations
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-bold text-xs">
                        14:00
                      </div>
                      <div>
                        <p className="font-bold text-sm">Volcano Hiking Tour</p>
                        <p className="text-xs text-muted-foreground">Guide: Marcos • 12 Pax</p>
                      </div>
                    </div>
                  ))}
                </div>
             </Card>
             <Card className="p-6 rounded-[24px] border border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-amber-500">
                  <AlertCircle className="w-4 h-4" /> Action Required
                </h3>
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-amber-600 dark:text-amber-400">Confirm Payment: Smith Family</p>
                        <p className="text-xs text-muted-foreground mt-1">Due today at 5:00 PM</p>
                      </div>
                    </div>
                  ))}
                </div>
             </Card>
          </div>
        </div>

        {/* Right Sidebar: AI & Feed */}
        <div className="space-y-6">
          <Card className="p-6 rounded-[24px] border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
            <h3 className="font-black text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Smart Insights
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-2xl bg-background/50 border border-border backdrop-blur-sm">
                <p className="text-sm font-medium">Conversion rate for "Luxury Honeymoon" increased by 15% this week. Consider increasing ad budget.</p>
              </div>
              <div className="p-4 rounded-2xl bg-background/50 border border-border backdrop-blur-sm">
                <p className="text-sm font-medium">3 VIP clients are arriving tomorrow. Team has been notified.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[24px] border border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
            <h3 className="font-bold mb-6">Live Activity</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {activityFeed.map((item, index) => (
                <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded-xl bg-muted/30 border border-border/50 shadow-sm">
                    <p className="text-xs font-bold text-foreground">{item.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{item.time} • {item.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
