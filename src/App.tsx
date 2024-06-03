import "./App.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-3xl">
            Future Career Interviewing App
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-center text-lg text-gray-600">
              Prepare for your future career with our AI-powered interviewing
              app. Sign up now to gain access!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
