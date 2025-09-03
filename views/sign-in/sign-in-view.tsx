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
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is Required" }),
});

export const SignInView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    authClient.signIn.email(
      {
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
          setError(error.message);
        },
      }
    );
  };

  const onSocial = (provider: "github" | "google") => {
    setError(null);
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
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      <Card className="w-full max-w-sm shadow-lg border-0 rounded-2xl bg-white">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
                <p className="text-sm text-gray-600">
                  Welcome back! Please enter your details.
                </p>
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        className="rounded-lg border-gray-200 focus:border-orange-300 focus:ring-orange-100"
                        {...field}
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
                        className="rounded-lg border-gray-200 focus:border-orange-300 focus:ring-orange-100"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Error Alert */}
              {error && (
                <Alert className="bg-red-50 border-red-200 rounded-lg flex items-center gap-2">
                  <OctagonAlertIcon className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-700 text-sm">{error}</AlertTitle>
                </Alert>
              )}

              {/* Sign in button */}
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                disabled={pending}
              >
                {pending ? "Signing In..." : "Sign In"}
              </Button>

              {/* Social Login */}
              <div className="relative text-center text-sm">
                <span className="bg-white px-3 text-gray-500 relative z-10">
                  Or continue with
                </span>
                <div className="absolute top-1/2 left-0 w-full border-t border-gray-200 -z-10"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full rounded-lg border-gray-200 hover:border-gray-300"
                  disabled={pending}
                  onClick={() => onSocial("github")}
                >
                  <FaGithub className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full rounded-lg border-gray-200 hover:border-gray-300"
                  disabled={pending}
                  onClick={() => onSocial("google")}
                >
                  <FaGoogle className="h-4 w-4" />
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="text-orange-600 hover:text-orange-700 underline">
                  Sign Up
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
