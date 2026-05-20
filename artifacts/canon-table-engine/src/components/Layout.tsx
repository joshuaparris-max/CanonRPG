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
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Map },
  { href: "/session", label: "Run Session", icon: Sword },
  { href: "/dm-prep", label: "DM Prep", icon: BookOpen },
  { href: "/combat", label: "Combat", icon: Shield },
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/sourcebook", label: "Sourcebook", icon: ClipboardList },
  { href: "/canon-audit", label: "Canon Audit", icon: ChevronRight },
  { href: "/save-manager", label: "Save Manager", icon: Save },
  { href: "/session-summary", label: "Session Summary", icon: FileText },
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
        className={`fixed top-0 left-0 h-full w-56 bg-sidebar border-r border-sidebar-border z-30 flex flex-col transition-transform md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:flex`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div>
            <h1 className="font-serif text-primary text-sm font-bold tracking-widest uppercase">
              Canon Table
            </h1>
            <p className="text-muted-foreground text-xs">Engine v2</p>
          </div>
          <button
            className="md:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-primary border-r-2 border-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                onClick={() => setSidebarOpen(false)}
                data-testid={`nav-${href.replace("/", "") || "home"}`}
              >
                <Icon size={15} className="flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border text-xs text-muted-foreground space-y-1">
          {lastSavedDisplay && (
            <p className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Saved {lastSavedDisplay}
            </p>
          )}
          {session.campaignMode && (
            <p className="truncate text-primary/70">
              {session.campaignMode === "candlekeep"
                ? "Candlekeep Mysteries"
                : session.campaignMode === "yawning_portal"
                ? "Tales from the Yawning Portal"
                : session.campaignMode === "ravnica"
                ? "Ravnica"
                : session.campaignMode}
            </p>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu size={18} />
          </Button>
          <h1 className="font-serif text-primary text-sm font-bold tracking-widest uppercase">
            Canon Table Engine
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        <footer className="border-t border-border px-4 py-2 text-xs text-muted-foreground text-center">
          Unofficial reference companion. Not affiliated with or endorsed by Wizards of the Coast. Use with sourcebooks you own.
        </footer>
      </div>
    </div>
  );
}
