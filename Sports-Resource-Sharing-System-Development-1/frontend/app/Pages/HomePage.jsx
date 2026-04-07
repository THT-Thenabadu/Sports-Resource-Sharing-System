import React from "react";
import Hero from "../components/Hero";
import Value from "../components/Value.jsx";
import Ctabanner from "../components/Ctabanner.jsx";
import Featured from "../components/featured.jsx";


const HomePage = () => {
    return (
      <>
       
        <main>
          <Hero />
          <Value />
          <Ctabanner />
          <Featured />
        </main>
       
      </>
    );
  };
   
  export default HomePage;