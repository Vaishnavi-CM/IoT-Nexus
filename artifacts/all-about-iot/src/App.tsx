import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";

// Pages
import Home from "@/pages/Home";
import Concepts from "@/pages/Concepts";
import ConceptDetail from "@/pages/ConceptDetail";
import Learn from "@/pages/Learn";
import Simulations from "@/pages/Simulations";
import Dashboard from "@/pages/Dashboard";
import Quiz from "@/pages/Quiz";
import Chatbot from "@/pages/Chatbot";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/concepts" component={Concepts} />
      <Route path="/concepts/:slug" component={ConceptDetail} />
      <Route path="/learn" component={Learn} />
      <Route path="/simulations" component={Simulations} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/chatbot" component={Chatbot} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Router />
            </main>
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
