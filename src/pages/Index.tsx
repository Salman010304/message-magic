import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Nurani Coaching Manager - Student Fee & Finance Tracker</title>
        <meta name="description" content="Complete coaching class management system for tracking student fees, expenses, and finances. Manage students, send WhatsApp reminders, and generate reports." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      
      <TooltipProvider>
        <AppProvider>
          <AppLayout />
        </AppProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </>
  );
};

export default Index;
