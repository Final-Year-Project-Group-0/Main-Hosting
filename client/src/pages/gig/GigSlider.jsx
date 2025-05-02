import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./GigSlider.scss";

const GigSlider = ({ children, slidesToShow, arrowsScroll }) => {
  // Configure settings for the Slick carousel
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow || 1,
    slidesToScroll: arrowsScroll || 1,
    centerMode: true,
    centerPadding: "0px",
    prevArrow: (
      <button className="slider-arrow prev-arrow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    ),
    nextArrow: (
      <button className="slider-arrow next-arrow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    ),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "0px",
        }
      }
    ]
  };

  return (
    <div className="gig-slider">
      <Slider {...settings}>
        {children}
      </Slider>
    </div>
  );
};

export default GigSlider;