import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import DmPrep from "@/pages/DmPrep";
import RunSession from "@/pages/RunSession";
import Combat from "@/pages/Combat";
import Characters from "@/pages/Characters";
import Sourcebook from "@/pages/Sourcebook";
import CanonAudit from "@/pages/CanonAudit";
import SaveManager from "@/pages/SaveManager";
import SessionSummary from "@/pages/SessionSummary";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  return <>{children}</>;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dm-prep" component={DmPrep} />
        <Route path="/session" component={RunSession} />
        <Route path="/combat" component={Combat} />
        <Route path="/characters" component={Characters} />
        <Route path="/sourcebook" component={Sourcebook} />
        <Route path="/canon-audit" component={CanonAudit} />
        <Route path="/save-manager" component={SaveManager} />
        <Route path="/session-summary" component={SessionSummary} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
