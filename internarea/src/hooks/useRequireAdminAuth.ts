import { isAdminAuthenticated } from "@/utils/adminAuth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const useRequireAdminAuth = () => {
  const router = useRouter();
  const [isCheckingAdminAuth, setIsCheckingAdminAuth] = useState(true);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/adminlogin");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsCheckingAdminAuth(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router]);

  return isCheckingAdminAuth;
};
