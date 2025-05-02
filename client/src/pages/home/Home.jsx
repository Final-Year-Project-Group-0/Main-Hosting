import React from "react";
import "./Home.scss";
import Slide from "../../components/slide/Slide";
import Featured from "../../components/featured/Featured";
import { cards } from "../../data";
import CatCard from "../../components/catCard/CatCard";
import HowItWorks from "../../components/howitworks/HowItWorks";
import ProjectCard from "../../components/projectCard/ProjectCard";
import { projects } from "../../data";
import FreelancingCTA from "../../components/cta/cta";
import WhyFreelancify from "../../components/WhyFreelancify/whyfreelancify";
import RandomGigs from "../../components/randomGigs/RandomGigs";

const Home = () => {
  return (
    <div className="home">
      <Featured />
      <HowItWorks />
      <Slide slidesToShow={5} arrowsScroll={1}>
        {cards.map((item) => (
          <CatCard key={item.id} item={item} />
        ))}
      </Slide>
      
      <div className="features">
        <div className="container">
          <div className="item">
            <h1>A whole world of freelance talent at your fingertips</h1>
            <p>
              Access top freelancers from around the globe to help you bring your projects to life.
              Get quality work done on time, every time.
            </p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="tick-container">
                  <svg className="tick" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="title">The best for every budget</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="tick-container">
                  <svg className="tick" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="title">Quality work done quickly</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="tick-container">
                  <svg className="tick" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="title">Diverse skill sets available</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="tick-container">
                  <svg className="tick" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="title">Seamless collaboration</p>
                </div>
              </div>
            </div>
            
            <a href="#" className="cta-button">
              Find Talent
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          
          <div className="item">
            <div className="image-container">
              <img src="./img/global.jpg" alt="Global freelance talent network" />
            </div>
          </div>
        </div>
      </div>
      
      <WhyFreelancify />
      <RandomGigs/>
      
      {/* <Slide slidesToShow={4} arrowsScroll={4}>
        {projects.map((item) => (
          <ProjectCard key={item.id} item={item} />
        ))}
      </Slide> */}

      <FreelancingCTA />
    </div>
  );
};

export default Home;
