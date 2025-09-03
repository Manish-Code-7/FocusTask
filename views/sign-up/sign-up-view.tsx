"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaGithub, FaGoogle } from "react-icons/fa";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { OctagonAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is Required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is Required" }),
    confirmPassword: z.string().min(1, { message: "Confirm Password is Required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const SignUpView = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setServerError(null);
    setPending(true);

    authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push("/");
        },
        onError: ({ error }) => {
          setPending(false);
          setServerError(error.message);
        },
      }
    );
  };

  const onSocial = (provider: "github" | "google") => {
    setServerError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => setPending(false),
        onError: ({ error }) => {
          setPending(false);
          setServerError(error.message);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      <Card className="w-full max-w-sm shadow-lg border-0 rounded-2xl bg-white">
        <CardHeader className="text-center space-y-2 pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">Create Account</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Fill in the details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        className="rounded-lg border-gray-200 focus:border-orange-300 focus:ring-orange-100"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="m@example.com" 
                        {...field} 
                        className="rounded-lg border-gray-200 focus:border-orange-300 focus:ring-orange-100"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="rounded-lg border-gray-200 focus:border-orange-300 focus:ring-orange-100"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="rounded-lg border-gray-200 focus:border-orange-300 focus:ring-orange-100"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Error messages */}
              {(form.formState.errors.confirmPassword || serverError) && (
                <Alert className="bg-red-50 border-red-200 rounded-lg flex items-center gap-2">
                  <OctagonAlertIcon className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-700 text-sm">
                    {form.formState.errors.confirmPassword?.message || serverError}
                  </AlertTitle>
                </Alert>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                disabled={pending}
              >
                {pending ? "Creating Account..." : "Sign Up"}
              </Button>

              {/* Social login divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-500">Or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => onSocial("github")} 
                  disabled={pending} 
                  className="rounded-lg border-gray-200 hover:border-gray-300"
                >
                  <FaGithub className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => onSocial("google")} 
                  disabled={pending} 
                  className="rounded-lg border-gray-200 hover:border-gray-300"
                >
                  <FaGoogle className="h-4 w-4" />
                </Button>
              </div>

              {/* Footer */}
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-orange-600 hover:text-orange-700 underline">
                  Sign In
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
