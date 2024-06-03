/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function InterviewFeedBackPage() {
  const { userInterviewId } = useParams();
  const [userInterview, setUserInterview] = useState<any>(null);

  const getInterview = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/userinterviews/" + userInterviewId
      );

      const newUserInterview = response.data;
      if (newUserInterview.transcript) {
        newUserInterview.transcript = JSON.parse(newUserInterview.transcript);

        newUserInterview.transcript.shift();
      }
      console.log(newUserInterview);
      setUserInterview(newUserInterview);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getInterview();
  }, []);

  useEffect(() => {
    if (userInterview?.feedback) return;
    const interval = setInterval(() => {
      getInterview();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Interview Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            {userInterview?.feedback
              ? userInterview?.feedback
              : "Generating feedback..."}
          </p>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Accordion type="single" collapsible>
        <AccordionItem value="transcript">
          <AccordionTrigger>
            <h2 className="text-xl font-semibold">Interview Transcript</h2>
          </AccordionTrigger>
          <AccordionContent>
            {userInterview?.transcript &&
              userInterview.transcript.map((message: any, index: number) => (
                <div key={index} className="mb-4">
                  <p>
                    <strong>
                      {message.role === "assistant" ? "Interviewer" : "You"}
                    </strong>
                    : {message.content}
                  </p>
                </div>
              ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default InterviewFeedBackPage;
