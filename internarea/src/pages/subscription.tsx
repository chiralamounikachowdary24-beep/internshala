import React, { useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { selectuser, setUser } from "@/Feature/Userslice";
import { Check, Clock, CreditCard, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

type PlanId = "bronze" | "silver" | "gold";

type UserState = {
  name?: string | null;
  email?: string | null;
  photo?: string | null;
  plan?: string;
};

type OrderResponse = {
  id: string;
  amount: number;
  currency: string;
  key?: string;
  planName: string;
  amountInRupees?: number;
  demo?: boolean;
};

const plans: Array<{
  id: PlanId;
  name: string;
  price: number;
  limit: string;
  features: string[];
}> = [
  {
    id: "bronze",
    name: "Bronze",
    price: 100,
    limit: "3 internship applications",
    features: ["Apply for up to 3 internships", "Monthly billing", "Invoice email after payment"],
  },
  {
    id: "silver",
    name: "Silver",
    price: 300,
    limit: "5 internship applications",
    features: ["Apply for up to 5 internships", "Monthly billing", "Invoice email after payment"],
  },
  {
    id: "gold",
    name: "Gold",
    price: 1000,
    limit: "Unlimited applications",
    features: ["Apply for unlimited internships", "Monthly billing", "Invoice email after payment"],
  },
];

export default function Subscription() {
  const user = useSelector(selectuser) as UserState | null;
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  // Custom Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<PlanId | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | null>(null);
  const [upiApp, setUpiApp] = useState<"phonepe" | "gpay" | "paytm" | null>(null);
  const [paymentOrderData, setPaymentOrderData] = useState<OrderResponse | null>(null);
  const [paytmStep, setPaytmStep] = useState(1);
  const [paytmPhone, setPaytmPhone] = useState("");
  const [paytmOtp, setPaytmOtp] = useState("");
  const [paytmGeneratedOtp, setPaytmGeneratedOtp] = useState("");

  const activePlan = useMemo(() => user?.plan || "free", [user?.plan]);

  const handlePaymentClick = async (plan: PlanId) => {
    if (!user?.email) {
      setMessage("Please login first.");
      return;
    }

    try {
      setLoadingPlan(plan);
      setMessage("");

      // Still create an order on the backend so we have proper logging
      const { data } = await axios.post<OrderResponse>(`${API_BASE_URL}/api/payment/create-order`, {
        plan,
        email: user.email,
      });

      setPaymentOrderData(data);
      setSelectedPlanForPayment(plan);
      setIsPaymentModalOpen(true);
      setPaymentMethod(null);
      setUpiApp(null);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; currentIstTime?: string }>;
      const apiMessage = axiosError.response?.data?.message || "Payment failed.";
      const currentIstTime = axiosError.response?.data?.currentIstTime;
      setMessage(currentIstTime ? `${apiMessage} Current IST time: ${currentIstTime}` : apiMessage);
    } finally {
      setLoadingPlan(null);
    }
  };

  const simulateSuccess = async () => {
    if (!paymentOrderData || !selectedPlanForPayment || !user?.email) return;
    
    try {
      setMessage("Processing payment...");
      setIsPaymentModalOpen(false);
      
      const verifyResponse = await axios.post(`${API_BASE_URL}/api/payment/verify`, {
        razorpay_order_id: paymentOrderData.demo ? paymentOrderData.id : `order_dummy_${Date.now()}`,
        razorpay_payment_id: `pay_dummy_${Date.now()}`,
        razorpay_signature: "demo",
        email: user.email,
        plan: selectedPlanForPayment,
      });

      dispatch(
        setUser({
          ...user,
          plan: verifyResponse.data.plan,
        })
      );
      setMessage(verifyResponse.data.message || "Payment successful. Plan upgraded.");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message || "Payment verification failed.");
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
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-3xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            <Clock size={16} />
            Payments open daily from 10:00 AM to 11:00 AM IST
          </p>
          <h1 className="text-3xl font-bold">Choose your internship application plan</h1>
          <p className="mt-3 text-slate-600">
            Free users can apply for 1 internship. Upgrade to apply for more internships each month.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {message}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const isActive = activePlan === plan.id;
            const isLoading = loadingPlan === plan.id;

            return (
              <article key={plan.id} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{plan.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{plan.limit}</p>
                  </div>
                  {isActive && (
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  )}
                </div>

                <p className="mt-5 text-3xl font-bold">
                  Rs.{plan.price}
                  <span className="text-sm font-medium text-slate-500">/month</span>
                </p>

                <ul className="mt-5 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check size={16} className="text-emerald-700" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  onClick={() => handlePaymentClick(plan.id)}
                  disabled={isLoading || isActive}
                >
                  <CreditCard size={17} />
                  {isActive ? "Current plan" : isLoading ? "Loading..." : "Subscribe"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

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
              Amount to pay: <strong className="text-xl block mt-1">Rs. {paymentOrderData.amountInRupees || paymentOrderData.amount / 100}</strong>
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
                            if(!paytmPhone) { alert("Enter mobile number"); return; }
                            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
                            setPaytmGeneratedOtp(generatedOtp);
                            alert(`[PAYTM SMS] Your OTP is: ${generatedOtp}`);
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
                              alert("Invalid OTP");
                              return;
                            }
                            simulateSuccess();
                          }}
                          className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-emerald-300 active:scale-95"
                        >
                          Verify & Pay Rs. {paymentOrderData.amountInRupees || paymentOrderData.amount / 100}
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
                        value={`upi://pay?pa=test@upi&pn=Internarea&am=${paymentOrderData.amountInRupees || paymentOrderData.amount / 100}&cu=INR`} 
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
