import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, User as UserIcon } from "lucide-react";
import {auth,provider} from "../firebase/firebase";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, selectuser, setUser as setReduxUser } from "@/Feature/Userslice";
import { signInWithPopup,signOut } from "firebase/auth";  
import { toast } from "react-toastify";
import { FirebaseError } from "firebase/app";
import { clearAdminAuthenticated, isAdminAuthenticated } from "@/utils/adminAuth";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  getFirebaseLoginPayload,
  getLoginErrorMessage,
  startLoginAccess,
} from "@/utils/loginAccess";

interface User {
  uid?: string | null;
  name?: string | null;
  email?: string | null;
  photo?: string | null;
  phoneNumber?: string | null;
  plan?: string;
}

const Navbar = () => {
  const { t } = useTranslation();
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [failedProfilePhoto, setFailedProfilePhoto] = useState<string | null>(
    null
  );
  const user = useSelector(selectuser) as User | null;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async () => {
    if (isSigningIn) return;

    try {
      setIsSigningIn(true);
      sessionStorage.setItem("loginAccessInteractive", "1");
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = getFirebaseLoginPayload(result.user);
      const loginAccess = await startLoginAccess(loggedInUser);

      dispatch(setReduxUser(loginAccess.user || loggedInUser));
      toast.success(t("login_success"));
    } catch (error) {
      const errorCode = error instanceof FirebaseError ? error.code : "";
      const wasCancelled =
        errorCode === "auth/cancelled-popup-request" ||
        errorCode === "auth/popup-closed-by-user";

      if (!wasCancelled) {
        const fallbackMsg = error instanceof Error ? error.message : t("login_failed");
        toast.error(getLoginErrorMessage(error, fallbackMsg));
        console.error("Login failed:", error);
        await signOut(auth).catch(() => undefined);
      }
    } finally {
      sessionStorage.removeItem("loginAccessInteractive");
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    setIsProfileDropdown(false);
  };
  const handleAdminLogout = () => {
    clearAdminAuthenticated();
    toast.success("Admin logged out");
    router.push("/adminlogin");
  };
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsProfileDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(() => {
  const syncAdminAuth = () => {
    setIsAdminLoggedIn(isAdminAuthenticated());
  };

  syncAdminAuth();
  window.addEventListener("admin-auth-change", syncAdminAuth);
  window.addEventListener("storage", syncAdminAuth);

  return () => {
    window.removeEventListener("admin-auth-change", syncAdminAuth);
    window.removeEventListener("storage", syncAdminAuth);
  };
}, []);

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-blue-600">
              <img src="/logo.png" alt="Intern Area" className="h-16" />
            </Link>
          </div>
          {/* Navigation Links */}
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/internship" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <span>{t("internships")}</span>
            </Link>

            <Link href="/job" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <span>{t("jobs")}</span>
            </Link>

            <Link href="/subscription" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <span>{t("subscription")}</span>
            </Link>

            <Link href="/resume-builder" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <span>{t("resume_builder")}</span>
            </Link>

            <Link href="/feed" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <span>{t("feed")}</span>
            </Link>

            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder={t("search_placeholder")}
                className="ml-2 bg-transparent focus:outline-none text-sm w-48"
              />
            </div>
          </div>
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative flex items-center gap-3" ref={dropdownRef}>
                {/* Profile Button */}
                <button
                  className="flex items-center space-x-2"
                  onClick={() => setIsProfileDropdown(!isProfileDropdown)}
                >
                  {user.photo && failedProfilePhoto !== user.photo ? (
                    <img
                      src={user.photo}
                      alt="profile"
                      className="w-8 h-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setFailedProfilePhoto(user.photo || null)}
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <UserIcon className="h-5 w-5" />
                    </span>
                  )}

                  {isProfileDropdown ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                
                    <button
                      onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
                    >
                      {t("logout")}
                    </button>
                {/* Dropdown */}
                {isProfileDropdown && (
                  <div className="absolute right-0 top-11 w-52 bg-white rounded-lg shadow-lg py-2 z-50">
                    <p className="text-sm text-gray-500 font-semibold px-4">{user.name || "User"}</p>
                    <p className="text-xs text-gray-500 px-4 mb-2">
                      {user.email || "No email available"}
                    </p>
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserIcon className="h-4 w-4" />
                      {t("profile")}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                {isAdminLoggedIn ? (
                  <>
                    <Link href="/adminpanel" className="text-gray-600 hover:text-gray-800">
                      {t("admin_panel")}
                    </Link>
                    <button
                      onClick={handleAdminLogout}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
                    >
                      {t("admin_logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                    onClick={handleLogin}
                    disabled={isSigningIn}
                    className="group bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 flex items-center justify-center space-x-2 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
                      {isSigningIn ? t("signing_in") : t("continue_google")}
                    </span>
                  </button>
                  <Link href="/adminlogin" className="text-gray-600 hover:text-gray-800">
                    {t("admin")}
                  </Link>
                  </>
                )}
              </>
            )}
          </div>
          <div className="ml-3">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
