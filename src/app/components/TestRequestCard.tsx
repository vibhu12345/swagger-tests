
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Play, FileText, Plus } from "lucide-react";
import TestGenerationForm from "./TestGenerationForm";

interface TestRequest {
  id: string;
  swagger_json: string;
  additional_prompt: string;
  selected_language: string;
  generated_tests: string;
  created_at: string;
  is_generating: boolean;
}

interface TestRequestCardProps {
  request: TestRequest;
  onEdit: (id: string, data: Partial<TestRequest>) => void;
  onDelete: (id: string) => void;
  onRegenerate: (id: string) => void;
}

const TestRequestCard = ({ request, onEdit, onDelete, onRegenerate }: TestRequestCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = (data: { swagger_json: string; additional_prompt: string; selected_language: string }) => {
    onEdit(request.id, {
      ...data,
      generated_tests: "", // Clear previous results when editing
    });
    setIsEditing(false);
    // Trigger regeneration with new data
    setTimeout(() => onRegenerate(request.id), 100);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(request.generated_tests);
  };

  const getLanguageDisplay = (lang: string) => {
    const languageMap: Record<string, string> = {
      java: "Java",
      python: "Python",
      csharp: "C#",
    };
    return languageMap[lang] || lang;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {getLanguageDisplay(request.selected_language)} Test Generation
            </CardTitle>
            <CardDescription>
              Created: {request.created_at}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onRegenerate(request.id)}>
              <Play className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Swagger JSON</h4>
            <Textarea
              value={request.swagger_json}
              readOnly
              className="min-h-[120px] text-xs bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Additional Instructions</h4>
            <Textarea
              value={request.additional_prompt || "No additional instructions"}
              readOnly
              className="min-h-[120px] text-xs bg-gray-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm text-gray-700">Generated Test Cases</h4>
            {request.generated_tests && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyToClipboard}
              >
                Copy to Clipboard
              </Button>
            )}
          </div>
          
          {request.is_generating ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Generating test cases...</p>
            </div>
          ) : request.generated_tests ? (
            <Textarea
              value={request.generated_tests}
              readOnly
              className="min-h-[300px] font-mono text-xs"
            />
          ) : (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No test cases generated yet</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test Request</DialogTitle>
            <DialogDescription>
              Modify your test generation parameters and regenerate the test cases.
            </DialogDescription>
          </DialogHeader>
          <TestGenerationForm
            onSubmit={handleEdit}
            onCancel={() => setIsEditing(false)}
            initialData={{
              swagger_json: request.swagger_json,
              additional_prompt: request.additional_prompt,
              selected_language: request.selected_language,
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Test Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this test request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete(request.id);
                setShowDeleteConfirm(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TestRequestCard;
