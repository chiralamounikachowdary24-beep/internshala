import { selectuser } from "@/Feature/Userslice";
import axios from "axios";
import { ExternalLink, Mail, MonitorSmartphone, User } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
  name: string;
  email: string;
  photo: string;
}

type LoginHistory = {
  _id: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  device?: string;
  systemType?: string;
  ip?: string;
  status?: string;
  reason?: string;
  otpVerified?: boolean;
  createdAt?: string;
};

const fallbackUser: User = {
    name: "Rahul",
    email: "xyz@gmail.com",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces",
};

const ProfilePage = () => {
  const user = useSelector(selectuser) || fallbackUser;
  const [failedProfilePhoto, setFailedProfilePhoto] = useState<string | null>(
    null
  );
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [historyMessage, setHistoryMessage] = useState("");

  useEffect(() => {
    const fetchLoginHistory = async () => {
      if (!user?.email || user.email === fallbackUser.email) {
        return;
      }

      try {
        const { data } = await axios.get<LoginHistory[]>(`${API_BASE_URL}/api/auth/login-history`, {
          params: { email: user.email },
        });
        setLoginHistory(data);
        setHistoryMessage("");
      } catch (error) {
        console.error(error);
        setHistoryMessage("Unable to load login history right now.");
      }
    };

    fetchLoginHistory();
  }, [user?.email]);

  const formatLoginTime = (date?: string) => {
    if (!date) return "Unknown";

    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              {user?.photo && failedProfilePhoto !== user.photo ? (
                <img
                  src={user?.photo}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setFailedProfilePhoto(user.photo)}
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <div className="mt-2 flex items-center justify-center text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <span className="text-blue-600 font-semibold text-2xl">
                    0
                  </span>
                  <p className="text-blue-600 text-sm mt-1">
                    Active Applications
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <span className="text-green-600 font-semibold text-2xl">
                    0
                  </span>
                  <p className="text-green-600 text-sm mt-1">
                    Accepted Applications
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center pt-4">
                <Link
                  href="/userapplication"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  View Applications
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <MonitorSmartphone className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Login History</h2>
          </div>

          {historyMessage && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {historyMessage}
            </div>
          )}

          {loginHistory.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Browser</th>
                    <th className="px-4 py-3">OS</th>
                    <th className="px-4 py-3">System</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {loginHistory.map((login) => (
                    <tr key={login._id}>
                      <td className="whitespace-nowrap px-4 py-3">{formatLoginTime(login.createdAt)}</td>
                      <td className="px-4 py-3">
                        {login.browser || "Unknown"}
                        {login.browserVersion ? ` ${login.browserVersion}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        {login.os || "Unknown"}
                        {login.osVersion ? ` ${login.osVersion}` : ""}
                      </td>
                      <td className="px-4 py-3">{login.systemType || login.device || "Unknown"}</td>
                      <td className="px-4 py-3">{login.ip || "Unknown"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                            login.status === "success"
                              ? "bg-green-50 text-green-700"
                              : login.status === "blocked"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                          title={login.reason || ""}
                        >
                          {login.status === "success" && login.otpVerified
                            ? "success - OTP"
                            : login.status || "success"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
              No login history found for this account yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
