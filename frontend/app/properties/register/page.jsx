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
    try {
      const token = localStorage.getItem('token');
  
      // ✅ Use FormData to handle both text fields and images
      const formData = new FormData();
  
      // Text fields
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('sportType', form.sportType);
      formData.append('propertyType', form.propertyType);
      formData.append('address', form.address);
      formData.append('city', form.city);
      formData.append('postalCode', form.postalCode);
      formData.append('mapsLink', form.mapsLink);
      formData.append('pricePerHour', form.pricePerHour);
      formData.append('maxPlayers', form.maxPlayers);
      formData.append('openingTime', form.openingTime);
      formData.append('closingTime', form.closingTime);
  
      // Arrays need to be JSON stringified
      formData.append('availableDays', JSON.stringify(form.availableDays));
      formData.append('amenities', JSON.stringify(form.amenities));
  
      // ✅ Append each image file
      form.images.forEach(image => {
        formData.append('images', image);
      });
  
      const res = await fetch('http://localhost:8000/api/properties/register', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // ✅ Don't set Content-Type — browser sets it automatically for FormData
        },
        body: formData
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert('Property submitted for review!');
        router.push('/dashboard/owner');
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Could not connect to server');
    }
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