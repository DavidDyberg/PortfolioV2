import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const WakingUpCard = () => {
  return (
    <div className="flex justify-center py-8 animate-fade-up">
      <Card className="max-w-lg w-full border-primary/30 shadow-card">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="rounded-full bg-primary/10 p-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">Backend is starting up</CardTitle>
            <CardDescription className="mt-1">
              Waking up from an idle state
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            The backend has been inactive for a while and is currently starting up.
          </p>
          <p>
            <span className="text-foreground font-medium">Estimated startup time:</span> 2–5 minutes.
          </p>
          <p>Please keep this page open — content will appear automatically once it's ready.</p>
        </CardContent>
      </Card>
    </div>
  );
};
