import { Switch, Route } from "wouter";
import { queryClient } from "./src/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FocusMode from "@/pages/FocusMode";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/focus/:id" component={FocusMode} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
