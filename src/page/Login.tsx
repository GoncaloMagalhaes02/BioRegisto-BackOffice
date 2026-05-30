import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Alert,
  AlertAction,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

import { Input } from "@/components/ui/input";

import { Mail, Lock, EyeOff, Eye, CircleCheck, CircleX } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const [loading, setLoading] = useState(false);

  const [infoError, setInfoError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handeLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(true);
      setLoading(false);
      setInfoError(error.message);
      console.log(error.message);
      setTimeout(() => setError(false), 3000);
    } else {
      setSuccess(true);
      setEmail("");
      setPassword("");
      setLoading(false);
      navigate("/");

      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <>
      <section className="w-full flex flex-row items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-3xl py-3 pb-0 flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00802d"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-leaf-icon lucide-leaf m-4"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
              BioRegisto
            </CardTitle>
            <CardDescription className="text-center pt-0">
              BackOffice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6 mt-5">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10 pr-10"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-3 text-right">
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Esqueceu a palavra-passe?
                </a>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              className="w-full bg-green-800 text-white text-lg py-5 hover:bg-green-900 hover:cursor-pointer "
              onClick={handeLogin}
              disabled={loading}
            >
              {loading ? "A Entrar..." : "Entrar"}
            </Button>
          </CardFooter>
        </Card>
        {success && (
          <div className="grid w-full max-w-md items-start gap-4 absolute right-0 bottom-5">
            <Alert className="max-w-md mb-2 bg-green-50 border-green-200 text-green-800 py-4 ">
              <CircleCheck className="h-2 w-4 text-green-600" />
              <AlertDescription>Login efetuado com sucesso!</AlertDescription>
            </Alert>
          </div>
        )}

        {error && (
          <div className="grid w-full max-w-md items-start gap-4 absolute right-0 bottom-5">
            <Alert className="max-w-md mb-2 bg-red-50 border-red-200 text-red-800 py-4 ">
              <CircleX className="h-2 w-4 text-red-600" />
              <AlertDescription>{infoError}</AlertDescription>
            </Alert>
          </div>
        )}
      </section>
    </>
  );
}

export default Login;
