import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedModels from './components/FeaturedModels';
import VirtualTour from './components/VirtualTour';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="font-sans antialiased text-white bg-black selection:bg-ivm-primary selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <FeaturedModels />
        <VirtualTour />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default App;