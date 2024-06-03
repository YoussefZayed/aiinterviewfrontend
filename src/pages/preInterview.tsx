import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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
    <>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button disabled={!name} onClick={createInterview}>
        Start Interview
      </button>
    </>
  );
}

export default PreInterviewPage;
