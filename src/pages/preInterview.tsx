import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PreInterviewPage() {
  const { interviewId } = useParams();
  const [name, setName] = useState<string>("");

  const createInterview = async () => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/userinterviews",
        {
          interview_id: interviewId,
          name,
        }
      );
      window.location.href = `/${interviewId}/${response.data.id}`;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Welcome to the Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-center text-lg text-gray-600">
              Please enter your name to start the interview.
            </p>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full"
            />
            <Button
              disabled={!name}
              onClick={createInterview}
              className="w-full"
            >
              Start Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PreInterviewPage;
