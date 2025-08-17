"use client";
import { useState, useEffect, useContext } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import TestRequestCard from "@/app/components/TestRequestCard";
import TestGenerationForm from "@/app/components/TestGenerationForm";
import MinimizedTestRequestRow from "@/app/components/MinimizedTestRequestRow";
import { useRouter } from "next/navigation";
import { generateAITests,loadProjectBySlug, loadTestRequestsByProject,
   createTestRequest, updateTestRequest, updateTestRequestData, deleteTestRequest } from "@/app/actions";
import { AuthContext } from "@/app/authContext";
interface TestRequest {
  id: string;
  swagger_json: string;
  additional_prompt: string;
  selected_language: string;
  generated_tests: string;
  created_at: string;
  is_generating: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  slug: string;
}

const ProjectDetail = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const projectSlug = (params as any).slug[0];
  const navigate = useRouter().push;
  const [project, setProject] = useState<Project | null>(null);
  const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(
    null
  );
  const authContext = useContext(AuthContext);

  if (!authContext?.isAuthenticated) {
    navigate("/");
    return null;
  }

  // ✅ load project + requests from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!projectSlug) return;

      const { data: projectData, error: projectError } = await loadProjectBySlug(projectSlug);

      if (projectError) {
        console.error("Error fetching project:", projectError.message);
        return;
      }
      setProject(projectData);

      const { data: requests, error: requestError } = await loadTestRequestsByProject(projectData.id);

      if (requestError) {
        console.error("Error fetching requests:", requestError.message);
        return;
      }

      setTestRequests(requests);
      if (requests.length > 0) {
        setExpandedRequestId(requests[0].id);
      }
    };

    fetchData();
  }, [projectSlug]);

  // ✅ create request
  const handleCreateTestRequest = async (requestData: Omit<TestRequest, "id" | "created_at" | "generated_tests" | "is_generating">) => {
    if (!project) return;

    const { data, error } = await createTestRequest(
      project.id, requestData.swagger_json, requestData.additional_prompt, requestData.selected_language
    );
    if (error) {
      console.error("Error inserting test request:", error.message);
      return;
    }

    setTestRequests((prev) => [data, ...prev]);
    setShowNewRequestForm(false);
    setExpandedRequestId(data.id);

    handleGenerateTests(data.id, requestData);
  };

  // ✅ regenerate
  const handleGenerateTests = async (
    requestId: string,
    requestData: Omit<TestRequest, "id" | "created_at" | "generated_tests" | "is_generating">
  ) => {
    setTestRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, is_generating: true } : req
      )
    );

    const previousRequests = testRequests.filter((r) => r.id !== requestId);

    const generatedTests = await generateAITests(
      requestData.swagger_json,
      requestData.selected_language,
      requestData.additional_prompt,
      previousRequests
    );

    const { data, error } = await updateTestRequest(requestId, generatedTests);;

    if (error) {
      console.error("Error updating test request:", error.message);
      return;
    }

    setTestRequests((prev) =>
      prev.map((req) => (req.id === requestId ? data : req))
    );
  };

  // ✅ edit request
  const handleEditRequest = async (
    requestId: string,
    updatedData: Partial<TestRequest>
  ) => {
    const { data, error } = await updateTestRequestData(requestId, updatedData);
    if (error) {
      console.error("Error updating request:", error.message);
      return;
    }

    setTestRequests((prev) =>
      prev.map((req) => (req.id === requestId ? data : req))
    );
  };

  // ✅ delete request
  const handleDeleteRequest = async (requestId: string) => {
    const { error } = await deleteTestRequest(requestId);

    if (error) {
      console.error("Error deleting request:", error.message);
      return;
    }

    setTestRequests((prev) => prev.filter((req) => req.id !== requestId));

    if (expandedRequestId === requestId && testRequests.length > 1) {
      setExpandedRequestId(testRequests[1].id);
    } else if (testRequests.length <= 1) {
      setExpandedRequestId(null);
    }
  };

  const handleExpandRequest = (requestId: string) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/projects")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {project.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Generate and manage API test cases
              </p>
            </div>
          </div>
          <Button onClick={() => setShowNewRequestForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Test Request
          </Button>
        </div>

        {showNewRequestForm && (
          <TestGenerationForm
            onSubmit={handleCreateTestRequest}
            onCancel={() => setShowNewRequestForm(false)}
          />
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Test Generation History
          </h2>

          {testRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No test requests yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first test generation request to get started
                </p>
                <Button onClick={() => setShowNewRequestForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {testRequests.map((request) => (
                <div key={request.id}>
                  {expandedRequestId === request.id ? (
                    <TestRequestCard
                      request={{
                        ...request,
                        created_at: new Date(
                          request.created_at
                        ).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Kolkata",
                        }),
                      }}
                      onEdit={handleEditRequest}
                      onDelete={handleDeleteRequest}
                      onRegenerate={(id) =>
                        handleGenerateTests(id, request)
                      }
                    />
                  ) : (
                    <MinimizedTestRequestRow
                      request={{
                        ...request,
                        created_at: new Date(
                          request.created_at
                        ).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Kolkata",
                        }),
                      }}
                      onExpand={handleExpandRequest}
                      onRegenerate={(id) =>
                        handleGenerateTests(id, request)
                      }
                      isExpanded={false}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
