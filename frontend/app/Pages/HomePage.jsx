import React from "react";
import Hero from "../components/Hero";
import Value from "../components/Value.jsx";
import Ctabanner from "../components/Ctabanner.jsx";
import Featured from "../components/featured.jsx";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import PropertyOwnerCta from "../components/PropertyOwnerCta.jsx";
import RejectionBanner from "../components/RejectionBanner.jsx"; // ✅ add this

const HomePage = () => {
  return (
    <>
      <main>
        <RejectionBanner /> {/* ✅ sits right at the top before Hero */}
        <Hero />
        <Value />
        <Ctabanner />
        <PropertyOwnerCta />
        <Featured />
        <UpcomingEvents />
      </main>
    </>
  );
};

export default HomePage;