import Footer from "@/Components/Fotter";
import Navbar from "@/Components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../store/store";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { auth } from "@/firebase/firebase";
import { clearUser, setUser } from "@/Feature/Userslice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../i18n/config";
import PageTranslator from "@/Components/PageTranslator";
import Script from "next/script";
import { signOut } from "firebase/auth";
import {
  getFirebaseLoginPayload,
  getLoginErrorMessage,
  startLoginAccess,
} from "@/utils/loginAccess";

export default function App({ Component, pageProps }: AppProps) {
  function AuthListener() {
    const dispatch = useDispatch();

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (authuser) => {
        if (!authuser) {
          dispatch(clearUser());
          return;
        }

        if (sessionStorage.getItem("loginAccessInteractive") === "1") {
          return;
        }

        const loginPayload = getFirebaseLoginPayload(authuser);

        try {
          const loginAccess = await startLoginAccess(loginPayload);
          dispatch(setUser(loginAccess.user || { ...loginPayload, plan: "free" }));
        } catch (error) {
          await signOut(auth);
          dispatch(clearUser());
          toast.error(getLoginErrorMessage(error, "Login is not allowed right now."));
        }
      });

      return unsubscribe;
    }, [dispatch]);

    return null;
  }

  return (
    <Provider store={store}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <AuthListener />
      <PageTranslator />

      <div className="bg-white">
        <ToastContainer />
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </div>
    </Provider>
  );
}
