 "use client";
import { use, useContext, useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { validateLogin } from "@/app/actions"; // Adjust the import path as necessary
import Form from 'next/form';
import { AuthContext } from "./authContext";
import { useRouter } from 'next/navigation'
export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useRouter().push;
  const authContext = useContext(AuthContext);
  const handleLogin = async (formData: FormData) => { 
    const isValid = await validateLogin(username, password); 
    if (!isValid) {
      alert("Please enter valid credentials.");
      return;
    }
    else { authContext?.setAuthenticated(true);
      navigate('/projects');
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the test generator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
