import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Slide.scss";

const Slide = ({ children, slidesToShow, arrowsScroll }) => {
  const settings = {
    slidesToShow: slidesToShow,
    slidesToScroll: arrowsScroll,
    infinite: true,
    dots: false,
    arrows: true,
  };

  return (
    <div className="slide">
      <div className="container">
        <Slider {...settings}>{children}</Slider>
      </div>
    </div>
  );
};

export default Slide;
