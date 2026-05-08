import axios, { AxiosError } from "axios";
import { Languages, X } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { selectuser } from "@/Feature/Userslice";
import { supportedLanguages } from "../../i18n/config";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type UserState = {
  email?: string | null;
};

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const user = useSelector(selectuser) as UserState | null;
  const [pendingLanguage, setPendingLanguage] = useState("");
  const [otp, setOtp] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const applyLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || fallback;
  };

  const sendFrenchOtp = async () => {
    if (!user?.email) {
      toast.error(t("login_for_french"));
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/api/auth/language/send-otp`, {
        email: user.email,
        language: "fr",
      });
      toast.success(t("otp_sent"));
      setPendingLanguage("fr");
      setIsModalOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const language = event.target.value;

    if (language === "fr") {
      await sendFrenchOtp();
      return;
    }

    await applyLanguage(language);
  };

  const verifyFrenchOtp = async () => {
    if (!user?.email || !otp.trim()) return;

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/auth/language/verify-otp`, {
        email: user.email,
        language: pendingLanguage,
        otp,
      });

      if (response.data.success) {
        await applyLanguage("fr");
        setOtp("");
        setIsModalOpen(false);
        toast.success(t("otp_verified"));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid or expired OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700">
        <Languages className="h-4 w-4 text-gray-500" />
        <span className="sr-only">{t("language")}</span>
        <select
          value={i18n.resolvedLanguage || i18n.language}
          onChange={handleLanguageChange}
          disabled={isLoading}
          className="bg-transparent text-sm outline-none"
        >
          {supportedLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.nativeLabel}
            </option>
          ))}
        </select>
      </label>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t("french_otp_title")}</h2>
                <p className="mt-1 text-sm text-gray-600">{t("french_otp_message")}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label={t("cancel")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600"
              placeholder={t("enter_otp")}
            />

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
              >
                {t("cancel")}
              </button>
              <button
                onClick={verifyFrenchOtp}
                disabled={isLoading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {t("verify")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
