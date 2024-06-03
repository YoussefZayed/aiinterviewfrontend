import { ConversationalAi } from "@/components/conversationalAi";
import { useParams } from "react-router-dom";

function InterviewPage() {
  const { interviewId, userInterviewId } = useParams();

  return (
    <>
      <ConversationalAi
        interviewId={interviewId ?? ""}
        userInterviewId={userInterviewId ?? ""}
      />
    </>
  );
}

export default InterviewPage;
