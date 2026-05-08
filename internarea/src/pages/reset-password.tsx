import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { KeyRound, Mail, Phone, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ResetResponse = {
  message: string;
  password?: string;
};

type ResetMode = "email" | "phone";

export default function ResetPassword() {
  const [mode, setMode] = useState<ResetMode>("email");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isWarning, setIsWarning] = useState(false);

  const handleReset = async () => {
    const value = identifier.trim();

    if (!value) {
      setMessage(mode === "email" ? "Please enter your email." : "Please enter your phone number.");
      setIsWarning(true);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setGeneratedPassword("");
      setIsWarning(false);

      const { data } = await axios.post<ResetResponse>(`${API}/api/auth/reset-password`, {
        identifier: value,
        [mode === "email" ? "email" : "phoneNumber"]: value,
      });

      setMessage(data.message);
      setGeneratedPassword(data.password || "");
    } catch (error) {
      const axiosError = error as AxiosError<ResetResponse>;
      setMessage(axiosError.response?.data?.message || "Error occurred while resetting password.");
      setIsWarning(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-10 text-slate-950">
      <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <KeyRound size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Reset password</h1>
            <p className="text-sm text-slate-600">Generate a new password using your email or phone number.</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
              mode === "email" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"
            }`}
            onClick={() => {
              setMode("email");
              setIdentifier("");
              setMessage("");
            }}
          >
            <Mail size={16} />
            Email
          </button>
          <button
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
              mode === "phone" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"
            }`}
            onClick={() => {
              setMode("phone");
              setIdentifier("");
              setMessage("");
            }}
          >
            <Phone size={16} />
            Phone
          </button>
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {mode === "email" ? "Email address" : "Phone number"}
        </label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-600"
          type={mode === "email" ? "email" : "tel"}
          placeholder={mode === "email" ? "name@example.com" : "Enter phone number"}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />

        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          onClick={handleReset}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          {loading ? "Generating..." : "Generate new password"}
        </button>

        {message && (
          <div
            className={`mt-5 rounded-lg p-4 text-sm ${
              isWarning ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"
            }`}
          >
            {message}
          </div>
        )}

        {generatedPassword && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Generated password</p>
            <p className="mt-1 break-all font-mono text-xl font-bold tracking-normal text-slate-950">
              {generatedPassword}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
