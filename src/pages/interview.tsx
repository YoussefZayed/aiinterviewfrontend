import { ConversationalAi } from "@/components/conversationalAi";
import { useState } from "react";
import { useParams } from "react-router-dom";

function InterviewPage() {
  const { interviewId, userInterviewId } = useParams();

  return (
    <>
      <ConversationalAi
        interviewId={interviewId}
        userInterviewId={userInterviewId}
      />
    </>
  );
}

export default InterviewPage;
