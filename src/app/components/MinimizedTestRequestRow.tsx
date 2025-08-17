
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { ChevronDown, ChevronUp, Play, FileText } from "lucide-react";


interface TestRequest {
  id: string;
  swagger_json: string;
  additional_prompt: string;
  selected_language: string;
  generated_tests: string;
  created_at: string;
  is_generating: boolean;
}
interface MinimizedTestRequestRowProps {
  request: TestRequest;
  onExpand: (id: string) => void;
  onRegenerate: (id: string) => void;
  isExpanded: boolean;
}

const MinimizedTestRequestRow = ({ 
  request, 
  onExpand, 
  onRegenerate, 
  isExpanded 
}: MinimizedTestRequestRowProps) => {
  const getLanguageDisplay = (lang: string) => {
    const languageMap: Record<string, string> = {
      java: "Java",
      python: "Python",
      csharp: "C#",
    };
    return languageMap[lang] || lang;
  };

  const getStatusIcon = () => {
    if (request.is_generating) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
    }
    if (request.generated_tests) {
      return <div className="h-4 w-4 rounded-full bg-green-500"></div>;
    }
    return <div className="h-4 w-4 rounded-full bg-gray-300"></div>;
  };

  const getStatusText = () => {
    if (request.is_generating) return "Generating...";
    if (request.generated_tests) return "Completed";
    return "Pending";
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {getLanguageDisplay(request.selected_language)} Test Generation
              </span>
            </div>
            
            <div className="text-sm text-gray-500">
              {request.created_at}
            </div>
            
            <div className="text-sm text-gray-600">
              Status: {getStatusText()}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRegenerate(request.id)}
              disabled={request.is_generating}
            >
              <Play className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onExpand(request.id)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MinimizedTestRequestRow;
