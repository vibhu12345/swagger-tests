'use server'
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
interface TestRequest {
  id: string;
  swagger_json: string;
  additional_prompt: string;
  selected_language: string;
  generated_tests: string;
  created_at: string;
  is_generating: boolean;
}
import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://qwsfuitvqvtfnbtwodcp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3c2Z1aXR2cXZ0Zm5idHdvZGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjE3NDcsImV4cCI6MjA3MDk5Nzc0N30.iNss6Q9bOlkWlRP_QHaqb1da3sw5fUZftnp2bhV_Z3Q"
);
export async function loadProjectsFromDb() {
   return await supabase.from("projects").select("*").order("created_at", { ascending: false });
}
export async function loadProjectBySlug(projectSlug: string) {
  return await supabase
        .from("projects")
        .select("*")
        .eq("slug", projectSlug)
        .single();
}
export async function loadTestRequestsByProject(projectId: string) {
  return await supabase
        .from("test_requests")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
}
export async function createProject(name: string, description: string, slug: string) {
  return await supabase
        .from("projects")
        .insert([
          { slug, name: name, description: description }
        ])
        .select()
        .single();
}

export async function createTestRequest(projectId: string, swagger_json: string, additional_prompt: string, selected_language: string) {
  return await supabase
      .from("test_requests")
      .insert([
        {
          project_id: projectId,
          swagger_json: swagger_json,
          additional_prompt: additional_prompt,
          selected_language: selected_language,
          generated_tests: "",
          is_generating: false,
        },
      ])
      .select()
      .single();
}
export async function updateTestRequest(requestId: string, generated_tests: string) {
  return await supabase
      .from("test_requests")
      .update({
        generated_tests: generated_tests,
        is_generating: false,
      })
      .eq("id", requestId)
      .select()
      .single(); 
}
export async function updateTestRequestData(requestId: string, updatedData: Partial<TestRequest>) {
  return await supabase
      .from("test_requests")
      .update(updatedData)
      .eq("id", requestId)
      .select()
      .single();
}
export async function deleteTestRequest(requestId: string) {
  return await supabase
      .from("test_requests")
      .delete()
      .eq("id", requestId);
} 
export async function validateLogin(username: string, password:string) {
    if (username!="admin" || password!="@$min955") {
        return false;
    }
    else{
       return true;
    }
}
const llm = new ChatTogetherAI({
  apiKey: "053d443ca7bcc5cd4837d34dd5a2b3efe3938ded75f4bf8618105da486b51aef",
  modelName: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  temperature: 0.3, 
  maxTokens: 2000,
});
export async function generateAITests(swagger_json: string, language: string = 'JAVA', custom_prompt: string = 'Generate 2 positive and 2 negative test cases', previousRequests: TestRequest[]) {
  try {
    // --- Create vector store from ALL project history ---
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  const allDocs: string[] = [];

  // Add swagger + tests from previous requests
  for (const req of previousRequests) {
    allDocs.push(req.swagger_json);
    if (req.generated_tests) {
      allDocs.push(req.generated_tests);
    }
  }

  // Add current swagger too
  allDocs.push(swagger_json);

  const docs = await splitter.createDocuments(allDocs);

  const vectorStore = await MemoryVectorStore.fromDocuments(docs, 
    new HuggingFaceInferenceEmbeddings({ apiKey: "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",
        model: 'sentence-transformers/all-MiniLM-L6-v2'}));

  const relevantDocs = await vectorStore.similaritySearch(custom_prompt, 5);
  const retrievedContext = relevantDocs.map((d) => d.pageContent).join('\n');
  // --- Build conversation memory from prompts/responses ---
  const conversationHistory = previousRequests
    .map(
      r =>
        `USER: ${r.additional_prompt}\nASSISTANT: ${
          r.generated_tests || "(no response)"
        }`
    )
    .join("\n");  // --- Fusion prompt ---
  const fullPrompt = `
  You are a senior QA engineer.
  Use BOTH the accumulated project knowledge (Swagger + previous test cases)
  AND the conversation history to generate high-quality API test cases.

  Project domain context:
  ${retrievedContext}

  Conversation history so far:
  ${conversationHistory}

  New request:
  ${custom_prompt}

  Generate the API test cases in ${language}, using ${
      language.toLowerCase() === "java"
        ? "REST Assured"
        : language.toLowerCase() === "csharp"
        ? "RestSharp"
        : "Requests"
    }.
  `;
    const response = await llm.invoke(fullPrompt);
    const output = response?.content || '';
    return output.toString().trim();
  } catch (error: any) {
    console.error('[API_ERROR]', error);
    return error.message || 'An error occurred while generating tests';
  }
}
