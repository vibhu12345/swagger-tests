
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Play } from "lucide-react";

interface TestGenerationFormProps {
  onSubmit: (data: {
    swagger_json: string;
    additional_prompt: string;
    selected_language: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    swagger_json: string;
    additional_prompt: string;
    selected_language: string;
  };
}

const TestGenerationForm = ({ onSubmit, onCancel, initialData }: TestGenerationFormProps) => {
  const [swaggerJson, setSwaggerJson] = useState(initialData?.swagger_json || "");
  const [additionalPrompt, setAdditionalPrompt] = useState(initialData?.additional_prompt || "");
  const [selectedLanguage, setSelectedLanguage] = useState(initialData?.selected_language || "");

  const handleSubmit = () => {
    if (!swaggerJson.trim() || !selectedLanguage) {
      alert("Please provide Swagger JSON and select a language");
      return;
    }

    onSubmit({
      swagger_json: swaggerJson,
      additional_prompt: additionalPrompt,
      selected_language: selectedLanguage,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Generation Setup</CardTitle>
        <CardDescription>
          Provide your Swagger JSON and configuration to generate test cases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="swaggerJson">Swagger JSON</Label>
          <Textarea
            id="swaggerJson"
            value={swaggerJson}
            onChange={(e) => setSwaggerJson(e.target.value)}
            placeholder="Paste your Swagger JSON here..."
            className="min-h-[200px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language">Target Language</Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select programming language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalPrompt">Additional Instructions (Optional)</Label>
          <Textarea
            id="additionalPrompt"
            value={additionalPrompt}
            onChange={(e) => setAdditionalPrompt(e.target.value)}
            placeholder="Add any specific requirements or instructions for test generation..."
            className="min-h-[100px]"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit} 
            disabled={!swaggerJson.trim() || !selectedLanguage}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            Generate Test Cases
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestGenerationForm;
