import React, { useState } from 'react';

interface TestimonialProps {
  quote: string;
  author: string;
  position: string;
  company: string;
  image?: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, position, company, image }) => {
  return (
    <div className="testimonial">
      <div className="testimonial-content">
        <p className="testimonial-quote font-tagline">"{quote}"</p>
      </div>
      <div className="testimonial-author">
        {image && (
          <div className="author-image">
            <img src={image} alt={author} />
          </div>
        )}
        <div className="author-info">
          <h4 className="author-name font-body">{author}</h4>
          <p className="author-position font-body">{position}</p>
          <p className="author-company font-body">{company}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      quote: "Surus brings the custody backbone Etherfuse needs to scale across jurisdictions, products, and chains. From trust structures to real accountability, this is what compliant onchain finance looks like.",
      author: "David Taylor",
      position: "CEO & Co-Founder",
      company: "Etherfuse",
      image: "/images/testimonials/david-taylor.jpg"
    },
    {
      quote: "Working with Surus has allowed us to focus on building our product while they handle the complex regulatory and custody requirements.",
      author: "Jane Smith",
      position: "CTO",
      company: "BlockFin",
      image: "/images/testimonials/jane-smith.jpg"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonials-section organic-sketch-pattern">
      <div className="testimonials-container">
        <h2 className="testimonials-heading font-section-header">Our Clients are Saying</h2>
        
        <div className="testimonials-carousel">
          <Testimonial {...testimonials[currentIndex]} />
          
          <div className="carousel-controls">
            <button className="carousel-arrow prev" onClick={prevTestimonial}>
              &lt;
            </button>
            <div className="carousel-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
            <button className="carousel-arrow next" onClick={nextTestimonial}>
              &gt;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
