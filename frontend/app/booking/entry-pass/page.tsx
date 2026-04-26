'use client';

import QRCode from "react-qr-code";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function PassContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Avoid hydration mismatch on the server
    }

    if (!token) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
                 <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
                     <span className="material-symbols-outlined text-4xl">error</span>
                 </div>
                 <h2 className="text-xl font-bold text-gray-800 mb-2">Pass Not Found</h2>
                 <p className="text-gray-500 mb-6 max-w-sm">We couldn&apos;t find the entry pass. Provide a valid ticket token.</p>
                 <Link href="/booking" className="px-6 py-2.5 bg-[#112240] text-white rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer">
                     Go Back
                 </Link>
             </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 font-sans bg-gray-50">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#112240] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                    <span className="material-symbols-outlined text-white text-3xl">sports_soccer</span>
                </div>

                <h1 className="text-2xl font-extrabold text-gray-900 mb-1 text-center">Your Entry Pass</h1>
                <p className="text-sm text-gray-500 mb-8 text-center pb-6 border-b border-gray-100 w-full">Present this QR to the security</p>

                <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm mb-8 transform transition-transform hover:scale-105 duration-300">
                     <QRCode
                        value={JSON.stringify({ code: token })}
                        size={200}
                        level="H"
                        fgColor="#112240"
                    />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 w-full text-center border border-gray-200">
                    <span className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Access Token</span>
                    <span className="block text-2xl font-mono font-bold tracking-[0.2em] text-[#112240]">{token}</span>
                </div>

                <div className="mt-8 text-center">
                     <Link href="/booking/my-bookings" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-4">
                        Return to Dashboard
                     </Link>
                </div>
            </div>
        </div>
    );
}

export default function EntryPassPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><div className="animate-spin h-8 w-8 border-4 border-[#112240] border-t-transparent rounded-full"></div></div>}>
            <PassContent />
        </Suspense>
    );
}
