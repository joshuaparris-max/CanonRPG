import { Link, useLocation } from "wouter";
import {
  Sword,
  Map,
  Users,
  BookOpen,
  Shield,
  ClipboardList,
  Save,
  FileText,
  ChevronRight,
  Menu,
  X,
  Settings,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

const NAV_GROUPS = [
  {
    label: "Campaign",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dm-prep", label: "DM Prep", icon: BookOpen },
      { href: "/session", label: "Run Session", icon: Sword },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/combat", label: "Combat Tracker", icon: Shield },
      { href: "/characters", label: "Characters", icon: Users },
      { href: "/dice", label: "Dice Roller", icon: Zap },
    ],
  },
  {
    label: "Data & Settings",
    items: [
      { href: "/sourcebook", label: "Sourcebook Data", icon: ClipboardList },
      { href: "/canon-audit", label: "Canon Audit", icon: ChevronRight },
      { href: "/save-manager", label: "Save Manager", icon: Save },
      { href: "/session-summary", label: "Session Summary", icon: FileText },
    ],
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session } = useSession();

  const lastSavedDisplay =
    session.lastSaved > 0
      ? new Date(session.lastSaved).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-30 flex flex-col transition-transform md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:flex`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
          <div>
            <h1 className="font-serif text-primary text-lg font-bold tracking-widest uppercase">
              Canon
            </h1>
            <p className="text-muted-foreground text-[10px] tracking-widest uppercase opacity-70">
              Table Engine v2.1
            </p>
          </div>
          <button
            className="md:hidden text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <h2 className="px-3 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50">
                {group.label}
              </h2>
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = location === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                      active
                        ? "bg-primary/10 text-primary font-bold shadow-sm border border-primary/20"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                    data-testid={`nav-${href.replace("/", "") || "home"}`}
                  >
                    <Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border bg-sidebar/30 space-y-3">
          {lastSavedDisplay && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground uppercase tracking-wider font-bold">Local Sync</span>
              <p className="flex items-center gap-1.5 text-green-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {lastSavedDisplay}
              </p>
            </div>
          )}
          {session.campaignMode && (
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Campaign</span>
              <p className="truncate text-primary font-serif text-xs">
                {session.campaignMode === "candlekeep"
                  ? "Candlekeep Mysteries"
                  : session.campaignMode === "yawning_portal"
                  ? "Tales from the Yawning Portal"
                  : session.campaignMode === "ravnica"
                  ? "Ravnica"
                  : session.campaignMode}
              </p>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex flex-col gap-2 px-4 py-3 border-b border-border bg-sidebar">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="p-1">
              <Menu size={18} />
            </Button>
            <h1 className="font-serif text-primary text-sm font-bold tracking-widest uppercase">
              Canon Table Engine
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            {lastSavedDisplay ? `Saved locally at ${lastSavedDisplay}` : "No saved session yet — data is stored locally."}
          </p>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        <footer className="border-t border-border bg-sidebar/10 px-6 py-4 text-[10px] leading-relaxed text-muted-foreground/60">
          <div className="max-w-4xl mx-auto space-y-1 text-center">
            <p className="font-bold text-muted-foreground/80">
              Unofficial DM companion. Not affiliated with or endorsed by Wizards of the Coast.
            </p>
            <p>
              This app does not include copyrighted adventure text, stat blocks, or spell descriptions. 
              Users must own the relevant sourcebooks to populate their local storage with private notes.
            </p>
            <p className="opacity-50">
              Dungeons & Dragons is a trademark of Wizards of the Coast LLC.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

