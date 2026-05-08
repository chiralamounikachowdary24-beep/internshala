import { selectuser } from "@/Feature/Userslice";
import axios, { AxiosError } from "axios";
import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Mail,
  Send,
  User,
  X,
  CreditCard
} from "lucide-react";
import React, { ChangeEvent, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const PREMIUM_PLANS = ["bronze", "silver", "gold"];

type ResumeForm = {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  personalDetails: string;
  skills: string;
  photo: string;
};

type UserState = {
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photo?: string | null;
  plan?: string;
};

type OrderResponse = {
  id: string;
  amount: number;
  currency: string;
  key?: string;
  demo?: boolean;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function OtpInput({ idPrefix = "otp", length = 6, value, onChange }: { idPrefix?: string; length?: number; value: string; onChange: (val: string) => void }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 1) {
      val = val[val.length - 1]; 
    }
    const newOtp = value.split("");
    while (newOtp.length < length) newOtp.push("");
    newOtp[index] = val;
    onChange(newOtp.join(""));
    
    if (val && index < length - 1) {
      document.getElementById(`${idPrefix}-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      document.getElementById(`${idPrefix}-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          type="text"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-10 h-12 text-center text-lg font-bold rounded-xl border border-gray-300 bg-gray-50 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
        />
      ))}
    </div>
  );
}

export default function ResumeBuilder() {
  const user = useSelector(selectuser) as UserState | null;
  const [form, setForm] = useState<ResumeForm>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    qualification: "",
    experience: "",
    personalDetails: "",
    skills: "",
    photo: user?.photo || "",
  });
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | null>(null);
  const [upiApp, setUpiApp] = useState<"phonepe" | "gpay" | "paytm" | null>(null);
  const [paymentOrderData, setPaymentOrderData] = useState<OrderResponse | null>(null);
  const [paytmStep, setPaytmStep] = useState(1);
  const [paytmPhone, setPaytmPhone] = useState("");
  const [paytmOtp, setPaytmOtp] = useState("");
  const [paytmGeneratedOtp, setPaytmGeneratedOtp] = useState("");

  const isPremium = useMemo(() => PREMIUM_PLANS.includes(user?.plan || ""), [user?.plan]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const photo = await readFileAsDataUrl(file);
    setForm((previous) => ({ ...previous, photo }));
  };

  const getApiMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || fallback;
  };

  const sendOTP = async () => {
    if (!form.email.trim()) {
      toast.error("Enter your email first");
      return;
    }

    if (!form.phone.trim()) {
      toast.error("Enter your phone number first");
      return;
    }

    if (!isPremium) {
      toast.error("Resume creation is available only for premium plan students");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/resume/send-otp`, {
        email: form.email,
        phone: form.phone,
      });
      toast.success("OTP sent to your mobile number");
      if (response.data.testOtp) {
        toast.info(`[TEST SMS] Your OTP is: ${response.data.testOtp}`, { autoClose: false });
      }
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to send OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) {
      toast.error("Enter OTP");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/resume/verify-otp`, {
        phone: form.phone,
        otp,
      });

      if (response.data.success) {
        setVerified(true);
        toast.success("Mobile number verified");
      }
    } catch (error) {
      toast.error(getApiMessage(error, "Invalid or expired OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!user?.email) {
      toast.error("Please login first");
      return false;
    }

    if (!isPremium) {
      toast.error("Resume creation is available only for premium plan students");
      return false;
    }

    if (!form.name || !form.email || !form.phone || !form.qualification || !form.experience || !form.personalDetails) {
      toast.error("Fill name, email, phone, qualification, experience and personal details");
      return false;
    }

    if (!verified) {
      toast.error("Verify your mobile number with OTP before payment");
      return false;
    }

    return true;
  };

  const resumePayload = () => ({
    ...form,
    userEmail: form.email,
  });

  const handlePaymentClick = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const { data } = await axios.post<OrderResponse>(`${API_BASE_URL}/api/resume/create-order`, {
        email: form.email,
        phone: form.phone,
      });

      setPaymentOrderData(data);
      setIsPaymentModalOpen(true);
      setPaymentMethod(null);
      setUpiApp(null);
    } catch (error) {
      toast.error(getApiMessage(error, "Failed to initialize payment"));
    } finally {
      setIsLoading(false);
    }
  };

  const simulateSuccess = async () => {
    if (!paymentOrderData) return;
    
    try {
      toast.info("Processing payment...");
      setIsPaymentModalOpen(false);
      
      const response = await axios.post(`${API_BASE_URL}/api/resume/verify-payment`, {
        razorpay_order_id: paymentOrderData.demo ? paymentOrderData.id : `resume_demo_${Date.now()}`,
        razorpay_payment_id: `resume_pay_demo_${Date.now()}`,
        razorpay_signature: "demo",
        resume: resumePayload(),
      });

      toast.success(response.data.message || "Resume created and added to your profile");
      setVerified(false); // reset verification after successful save
    } catch (error) {
      toast.error(getApiMessage(error, "Payment verification or resume saving failed"));
    }
  };

  const closeModal = () => {
    setIsPaymentModalOpen(false);
    setTimeout(() => {
      setPaymentMethod(null);
      setUpiApp(null);
    }, 200);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          <p className="mt-2 text-gray-600">
            Premium students can verify their mobile number with OTP, pay Rs 50, and save a resume to their profile.
          </p>
          {!isPremium && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-900">
              This feature is available only for bronze, silver and gold plan students.
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" /> Full name
                </span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your name"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4" /> Email
                </span>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 text-sm font-medium text-gray-700">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <GraduationCap className="h-4 w-4" /> Qualification
                </span>
                <textarea
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="B.Tech Computer Science, 2026"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BriefcaseBusiness className="h-4 w-4" /> Experience
                </span>
                <textarea
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Projects, internships, work experience"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 text-sm font-medium text-gray-700">Skills</span>
                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="React, Node.js, MongoDB"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 text-sm font-medium text-gray-700">Personal details</span>
                <textarea
                  name="personalDetails"
                  value={form.personalDetails}
                  onChange={handleChange}
                  className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Address, portfolio links, achievements"
                />
              </label>
            </div>

            <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
              {verified ? (
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Mobile number verified successfully!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number for Verification</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  {form.phone.trim() && (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-blue-200 pt-4">
                      <OtpInput idPrefix="form-otp" value={otp} onChange={setOtp} />
                      <div className="flex gap-3">
                        <button
                          onClick={sendOTP}
                          disabled={isLoading || !isPremium}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-blue-700 shadow-sm hover:bg-blue-100 disabled:opacity-60"
                        >
                          <Send className="h-4 w-4" /> Send OTP
                        </button>
                        <button
                          onClick={verifyOTP}
                          disabled={isLoading || !isPremium}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Verify
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handlePaymentClick}
              disabled={isLoading || !isPremium || !verified}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60 md:w-auto"
            >
              <BadgeIndianRupee className="h-5 w-5" /> Pay Rs 50 & Generate Resume
            </button>
          </section>

          <aside className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Resume Preview</h2>
            <div className="rounded-lg border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                {form.photo ? (
                  <img src={form.photo} alt="Resume photo" className="h-20 w-20 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                    Photo
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{form.name || "Your Name"}</h3>
                  <p className="text-sm text-gray-600">{form.email || "email@example.com"}</p>
                  <p className="text-sm text-gray-600">{form.phone || "Phone number"}</p>
                </div>
              </div>

              <div className="mt-6 space-y-5 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900">Qualification</h4>
                  <p className="mt-1 whitespace-pre-line">{form.qualification || "Your education details"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Experience</h4>
                  <p className="mt-1 whitespace-pre-line">{form.experience || "Your project or work experience"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Skills</h4>
                  <p className="mt-1">{form.skills || "Your skills"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Personal Details</h4>
                  <p className="mt-1 whitespace-pre-line">{form.personalDetails || "Your personal details"}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Custom Payment Modal */}
      {isPaymentModalOpen && paymentOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md scale-100 rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Payment Gateway</h2>
              <button onClick={closeModal} className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            
            <p className="mb-6 rounded-lg bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-800">
              Amount to pay: <strong className="text-xl block mt-1">Rs. {paymentOrderData.amount / 100}</strong>
            </p>

            {!paymentMethod ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                <button
                  onClick={() => setPaymentMethod("upi")}
                  className="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-gray-800 group-hover:text-emerald-700">UPI App (Scanner)</span>
                    <span className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</span>
                  </div>
                  <div className="flex gap-1 opacity-60">
                     <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">Pe</div>
                     <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-[10px]">Paytm</div>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-gray-800 group-hover:text-emerald-700">Credit / Debit Card</span>
                    <span className="text-xs text-gray-500">Visa, Mastercard, RuPay</span>
                  </div>
                  <CreditCard size={24} className="text-gray-400 group-hover:text-emerald-600" />
                </button>
              </div>
            ) : paymentMethod === "upi" ? (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                {!upiApp ? (
                  <div className="space-y-3">
                    <h3 className="mb-4 text-center text-sm font-semibold text-gray-600">Choose your preferred UPI App</h3>
                    <button onClick={() => setUpiApp("phonepe")} className="w-full rounded-xl border border-indigo-200 bg-indigo-50 py-3 font-bold text-indigo-700 transition-colors hover:bg-indigo-100">PhonePe</button>
                    <button onClick={() => setUpiApp("gpay")} className="w-full rounded-xl border border-blue-200 bg-blue-50 py-3 font-bold text-blue-700 transition-colors hover:bg-blue-100">Google Pay</button>
                    <button onClick={() => { setUpiApp("paytm"); setPaytmStep(1); setPaytmPhone(""); setPaytmOtp(""); }} className="w-full rounded-xl border border-sky-200 bg-sky-50 py-3 font-bold text-sky-700 transition-colors hover:bg-sky-100">Paytm</button>
                    <button onClick={() => setPaymentMethod(null)} className="mx-auto mt-6 block text-sm font-medium text-gray-400 transition-colors hover:text-gray-700">← Back to Payment Methods</button>
                  </div>
                ) : upiApp === "paytm" ? (
                  <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100">
                      <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs">Paytm</div>
                      <div>
                        <h3 className="font-bold text-gray-800">Login to Paytm</h3>
                        <p className="text-xs text-gray-500">Pay securely using your wallet</p>
                      </div>
                    </div>
                    
                    {paytmStep === 1 ? (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Mobile Number</label>
                          <input 
                            type="text" 
                            value={paytmPhone}
                            onChange={(e) => setPaytmPhone(e.target.value)}
                            placeholder="Enter your Paytm number" 
                            className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" 
                          />
                        </div>
                        <button
                          onClick={() => {
                            if(!paytmPhone) { toast.error("Enter mobile number"); return; }
                            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
                            setPaytmGeneratedOtp(generatedOtp);
                            toast.info(`[PAYTM SMS] Your OTP is: ${generatedOtp}`, { autoClose: false });
                            setPaytmStep(2);
                          }}
                          className="w-full rounded-xl bg-sky-600 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition-all hover:bg-sky-700 hover:shadow-sky-300 active:scale-95"
                        >
                          Proceed Securely
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-2">Enter the OTP sent to <span className="font-bold">{paytmPhone}</span></p>
                        <div>
                          <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-gray-500">One Time Password</label>
                          <OtpInput idPrefix="paytm-otp" value={paytmOtp} onChange={setPaytmOtp} />
                        </div>
                        <button
                          onClick={() => {
                            if (paytmOtp !== paytmGeneratedOtp) {
                              toast.error("Invalid OTP");
                              return;
                            }
                            toast.success("Paytm verification successful");
                            simulateSuccess();
                          }}
                          className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-emerald-300 active:scale-95"
                        >
                          Verify & Pay Rs. {paymentOrderData.amount / 100}
                        </button>
                        <button onClick={() => setPaytmStep(1)} className="mx-auto block text-xs font-medium text-sky-600 hover:underline">Change Mobile Number</button>
                      </div>
                    )}
                    <button onClick={() => setUpiApp(null)} className="mx-auto mt-6 block text-sm font-medium text-gray-400 transition-colors hover:text-gray-700">← Choose another UPI app</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                    <p className="mb-4 text-center font-bold text-gray-800">
                      Scan with {upiApp === "phonepe" ? "PhonePe" : "Google Pay"}
                    </p>
                    <div className="mb-6 rounded-2xl border-4 border-emerald-50 bg-white p-4 shadow-sm">
                      <QRCodeSVG 
                        value={`upi://pay?pa=test@upi&pn=Internarea&am=${paymentOrderData.amount / 100}&cu=INR`} 
                        size={200}
                        level="Q"
                      />
                    </div>
                    <button
                      onClick={simulateSuccess}
                      className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-emerald-300 active:scale-95"
                    >
                      Simulate Successful Payment
                    </button>
                    <button onClick={() => setUpiApp(null)} className="mt-4 text-sm font-medium text-gray-400 transition-colors hover:text-gray-700">← Choose another UPI app</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Card Number</label>
                    <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Expiry (MM/YY)</label>
                      <input type="text" placeholder="MM/YY" className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">CVV</label>
                      <input type="password" placeholder="***" className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Cardholder Name</label>
                    <input type="text" placeholder="Name on card" className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
                </div>
                <button
                  onClick={simulateSuccess}
                  className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-emerald-300 active:scale-95"
                >
                  Pay Now (Simulate)
                </button>
                <button onClick={() => setPaymentMethod(null)} className="mx-auto mt-4 block text-sm font-medium text-gray-400 transition-colors hover:text-gray-700">← Back to Payment Methods</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
