import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>API Client</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="https://api.example.com/endpoint" />
          <Button>Send</Button>
        </CardContent>
      </Card>
    </div>
  );
}