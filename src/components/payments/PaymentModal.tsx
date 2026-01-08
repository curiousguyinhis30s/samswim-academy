'use client';

import React, { useState, useEffect } from 'react';

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

const PACKAGES: Package[] = [
  {
    id: 'single',
    name: 'Single Lesson',
    price: 50,
    description: 'Perfect for a trial session or a one-off boost.',
  },
  {
    id: 'monthly',
    name: 'Monthly Package',
    price: 180,
    description: 'Billed monthly. Ideal for consistent progress.',
  },
  {
    id: 'term',
    name: 'Term Package',
    price: 450,
    description: 'Best value. Covers a full term (3 months).',
  },
];

export default function PaymentModal({ isOpen, onClose, studentId, studentName }: PaymentModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSelectPackage = async (pkg: Package) => {
    setSelectedPackage(pkg.id);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentId,
          packageType: pkg.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate checkout session');
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Unable to process payment. Please try again.');
      setSelectedPackage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all duration-300">
        {/* Header */}
        <div className="bg-sky-600 px-6 py-4 flex justify-between items-center">
          <div className="text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              💳 SamSwim Payments
            </h2>
            <p className="text-sky-100 text-sm mt-1">Secure payment via Stripe</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-sky-100 hover:text-white transition-colors p-1 rounded-full hover:bg-sky-700/50 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Student Info Summary */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center gap-3">
            <div className="bg-sky-100 text-sky-600 p-2 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Paying For</p>
              <p className="text-gray-900 font-medium">{studentName || 'Student'}</p>
            </div>
          </div>

          {/* Package Options */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a Package</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PACKAGES.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              const isDisabled = isLoading && !isSelected;

              return (
                <div
                  key={pkg.id}
                  onClick={() => !isDisabled && handleSelectPackage(pkg)}
                  className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-lg group ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
                      : 'border-gray-200 bg-white hover:border-sky-300'
                  } ${isDisabled ? 'opacity-60 cursor-not-allowed grayscale' : ''}`}
                >
                  {/* Price Tag */}
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-gray-900">RM{pkg.price}</span>
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-gray-800 mb-1">{pkg.name}</h4>

                  {/* Description */}
                  <p className="text-sm text-gray-500 mb-4 h-10">{pkg.description}</p>

                  {/* Action Button */}
                  <button
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-sky-100 group-hover:text-sky-700'
                    }`}
                    disabled={isDisabled}
                  >
                    {isSelected && isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : isSelected ? (
                      'Redirecting...'
                    ) : (
                      'Select'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-xs text-center text-gray-400">
            By proceeding, you agree to SamSwim Academy&apos;s terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
