/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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

  // while userInterview.feedback is blank refetch it every 5 seconds
  useEffect(() => {
    if (userInterview?.feedback) return;
    const interval = setInterval(() => {
      getInterview();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1>Feedback</h1>
      <h2>
        {userInterview?.feedback
          ? userInterview?.feedback
          : "Generating feedback"}
      </h2>
      <h1>Interview Transcript</h1>
      {userInterview?.transcript &&
        userInterview.transcript.map((message: any, index: number) => (
          <div key={index}>
            <p>
              <strong>
                {message.role == "assistant" ? "Interviewer" : "You"}
              </strong>
              : {message.content}
            </p>
          </div>
        ))}
    </>
  );
}

export default InterviewFeedBackPage;
