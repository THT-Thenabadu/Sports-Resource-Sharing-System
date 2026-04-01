'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterProgress from '../RegisterProgress';
import StepBasicInfo from '../StepBasicInfo';
import StepLocation from '../StepLocation';
import StepPricing from '../StepPricing';
import StepMediaAmenities from '../StepMediaAmenities';
import './register.css';

const initialForm = {
  // Step 1
  title: '',
  description: '',
  sportType: '',
  propertyType: '',
  // Step 2
  address: '',
  city: '',
  postalCode: '',
  mapsLink: '',
  // Step 3
  pricePerHour: '',
  maxPlayers: '',
  availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  openingTime: '08:00',
  closingTime: '22:00',
  // Step 4
  images: [],
  amenities: [],
};

export default function RegisterPropertyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const router = useRouter();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    console.log('Submitting:', form);
    // ✅ Backend call will go here later
    alert('Property submitted for review!');
    router.push('/');
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <RegisterProgress currentStep={step} />

        {step === 1 && (
          <StepBasicInfo
            data={form}
            onChange={handleChange}
            onNext={() => setStep(2)}
            onCancel={() => router.push('/')}
          />
        )}
        {step === 2 && (
          <StepLocation
            data={form}
            onChange={handleChange}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepPricing
            data={form}
            onChange={handleChange}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepMediaAmenities
            data={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}