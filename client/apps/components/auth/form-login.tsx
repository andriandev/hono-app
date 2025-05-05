"use client";

import { useState, useEffect } from "react";
import { fetchLogin } from "@/helpers/fetch";

export default function FormLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [token, setToken] = useState("");
  const [message, setMessage] = useState({
    username: "",
    password: "",
    error: "",
  });

  useEffect(() => {
    const token: any = localStorage.getItem("token");

    setToken(token);
  }, [isLoading]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);

    const result = await fetchLogin(formData, "/auth/login");

    setIsLoading(false);

    if (result?.status !== 200) {
      if (typeof result?.message === "object") {
        Object.entries(result?.message).forEach(([key, value]) => {
          setMessage((prev) => ({ ...prev, [key]: value }));
        });
      } else {
        setMessage((prev) => ({ ...prev, error: result?.message || "" }));
      }

      return;
    }

    alert("Login success");
    localStorage.setItem("token", result?.data?.token);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage({
      username: "",
      password: "",
      error: "",
    });
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <>
      {token ? (
        <>
          <div className="flex w-full flex-col justify-center gap-5 rounded-lg bg-slate-800 p-6 text-center sm:w-1/2 lg:w-1/3">
            <p>Login success.</p>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-indigo-600 py-1.5 text-center hover:bg-indigo-700"
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col rounded-lg bg-slate-800 p-4 sm:w-1/2 lg:w-1/3"
        >
          <input
            name="username"
            type="text"
            className="w-full rounded-lg border-0 bg-slate-700 p-1.5 focus:outline-none disabled:opacity-75"
            placeholder="Username"
            value={formData.username}
            onChange={handleChangeInput}
            disabled={isLoading}
            autoComplete="off"
            required
          />
          {message?.username ? (
            <p className="mt-1 text-xs text-red-400">{message?.username}</p>
          ) : (
            ""
          )}
          <input
            name="password"
            type="text"
            className="mt-3 w-full rounded-lg border-0 bg-slate-700 p-1.5 focus:outline-none disabled:opacity-75"
            placeholder="Password"
            value={formData.password}
            onChange={handleChangeInput}
            disabled={isLoading}
            autoComplete="off"
            required
          />
          {message?.password ? (
            <p className="mt-1 text-xs text-red-400">{message?.password}</p>
          ) : (
            ""
          )}
          <button
            type="submit"
            className="mt-3 rounded-lg bg-indigo-600 py-1.5 hover:bg-indigo-700 disabled:opacity-75 disabled:hover:bg-indigo-600"
            disabled={isLoading}
          >
            Login
          </button>
          {message?.error ? (
            <p className="mt-2 text-center text-xs text-red-400">
              {message?.error}
            </p>
          ) : (
            ""
          )}
        </form>
      )}
    </>
  );
}
