import React from "react";
import "./HowItWorksTest.css";

const HowItWorks = () => {
  const steps = [
    {
      icon: <i className="fas fa-search"></i>,
      title: "Find a Freelancer",
      description:
        "Browse portfolios and reviews to find the perfect match for your project.",
    },
    {
      icon: <i className="fas fa-comments"></i>,

      title: "Discuss and Communicate",
      description:
        "Engage in meaningful discussions, share ideas, and convey needs effectively.",
    },
    {
      icon: <i className="fas fa-user-check"></i>,

      title: "Hire",
      description:
        "Choose the best freelancer or services for your projects and needs.",
    },
    {
      icon: <i className="fas fa-clipboard-check"></i>,

      title: "Complete Project",
      description:
        "Work together, communicate effectively, and get the job done right.",
    },
  ];

  return (
    <section className="how-it-works">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Simple Process, Exceptional Results</p>

        <div className="steps-container">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="step-card">
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="step-connection"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
