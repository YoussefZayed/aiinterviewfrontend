import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  defaultFeedbackPrompt,
  systemPromptText,
  defaultTitleValue,
} from "@/lib/defaults";

function AdminPage() {
  const [userInterviews, setUserInterviews] = useState<any>(null);
  const [interviews, setInterviews] = useState<any>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [newInterview, setNewInterview] = useState({
    title: defaultTitleValue,
    system_prompt: systemPromptText,
    feedback_prompt: defaultFeedbackPrompt,
  });

  const createInterview = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/interviews`,
        newInterview
      );
      setInterviews([...interviews, response.data]);
      setNewInterview({
        title: "",
        system_prompt: "",
        feedback_prompt: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewInterviewChange = (field: string, value: string) => {
    setNewInterview((prevInterview) => ({
      ...prevInterview,
      [field]: value,
    }));
  };

  const getUserInterviews = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/userinterviews/"
      );

      const newUserInterviews = response.data;
      newUserInterviews.forEach((newUserInterview: any) => {
        if (newUserInterview.transcript) {
          newUserInterview.transcript = JSON.parse(newUserInterview.transcript);

          newUserInterview.transcript.shift();
        }
      });
      console.log(newUserInterviews);
      setUserInterviews(newUserInterviews);
    } catch (error) {
      console.error(error);
    }
  };

  const getInterviews = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/interviews/"
      );

      const newInterviews = response.data;
      console.log(newInterviews);
      setInterviews(newInterviews);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUserInterviews();
    getInterviews();
  }, []);

  const getUrl = () => {
    return window.location.href.split("/").slice(0, 3).join("/");
  };

  const updateInterview = async (id: string, updatedData: any) => {
    try {
      setSaving(true);
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${id}`,
        updatedData
      );
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const debouncedUpdateInterview = debounce(updateInterview, 1000);

  const handleInterviewChange = (id: string, field: string, value: string) => {
    setInterviews((prevInterviews: any) =>
      prevInterviews.map((interview: any) =>
        interview.id === id ? { ...interview, [field]: value } : interview
      )
    );
    debouncedUpdateInterview(id, { [field]: value });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-8">Create New Interview</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>Create New Interview</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new interview.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newInterview.title}
                className="col-span-3"
                onChange={(e) =>
                  handleNewInterviewChange("title", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="system_prompt" className="text-right">
                System Prompt
              </Label>
              <Textarea
                id="system_prompt"
                value={newInterview.system_prompt}
                className="col-span-3"
                onChange={(e) =>
                  handleNewInterviewChange("system_prompt", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feedback_prompt" className="text-right">
                Feedback Prompt
              </Label>
              <Textarea
                id="feedback_prompt"
                value={newInterview.feedback_prompt}
                className="col-span-3"
                onChange={(e) =>
                  handleNewInterviewChange("feedback_prompt", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
            <Button onClick={createInterview}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      <h1 className="text-3xl font-bold mb-8">Interviews</h1>
      <div className="grid grid-cols-1 gap-6">
        {interviews &&
          interviews.map((interview: any) => (
            <Card key={interview.id}>
              <CardHeader>
                <CardTitle>
                  <Input
                    type="text"
                    value={interview.title}
                    onChange={(e) =>
                      handleInterviewChange(
                        interview.id,
                        "title",
                        e.target.value
                      )
                    }
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Interview Link:{" "}
                  <a href={`${getUrl()}/${interview.id}`}>
                    {`${getUrl()}/${interview.id}`}
                  </a>
                </p>
                <Textarea
                  value={interview.system_prompt}
                  className="mb-4"
                  onChange={(e) =>
                    handleInterviewChange(
                      interview.id,
                      "system_prompt",
                      e.target.value
                    )
                  }
                />
                <Textarea
                  value={interview.feedback_prompt}
                  onChange={(e) =>
                    handleInterviewChange(
                      interview.id,
                      "feedback_prompt",
                      e.target.value
                    )
                  }
                />
                <Button
                  className="mt-4"
                  onClick={() =>
                    updateInterview(interview.id, {
                      title: interview.title,
                      system_prompt: interview.system_prompt,
                      feedback_prompt: interview.feedback_prompt,
                    })
                  }
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded">
          Saving...
        </div>
      )}

      <Separator className="my-8" />

      <h1 className="text-3xl font-bold mb-8">User Interviews</h1>
      <div className="grid grid-cols-1 gap-6">
        {userInterviews &&
          userInterviews.map((userInterview) => (
            <Card key={userInterview.id}>
              <CardHeader>
                <CardTitle>{userInterview.name}'s Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">
                  {userInterview?.feedback
                    ? userInterview?.feedback
                    : "Generating feedback"}
                </p>
                <h2 className="text-xl font-bold mb-4">Interview Transcript</h2>
                {userInterview?.transcript &&
                  userInterview.transcript.map(
                    (message: any, index: number) => (
                      <div key={index} className="mb-4">
                        <p>
                          <strong>
                            {message.role == "assistant"
                              ? "Interviewer"
                              : userInterview.name}
                          </strong>
                          : {message.content}
                        </p>
                      </div>
                    )
                  )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

export default AdminPage;
