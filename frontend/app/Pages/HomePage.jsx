import React from "react";
import Hero from "../components/Hero";
import Value from "../components/Value.jsx";
import Ctabanner from "../components/Ctabanner.jsx";
import Featured from "../components/featured.jsx";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import PropertyOwnerCta from "../components/PropertyOwnerCta.jsx";


const HomePage = () => {
    return (
      <>
       
        <main>
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