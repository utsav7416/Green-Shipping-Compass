

function ImageCarousel() {

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
  };

  const images = [
    {
      url: "https://images.pexels.com/photos/1554646/pexels-photo-1554646.jpeg",
      title: "Global Logistics Excellence",
      description: "Connecting continents through sustainable shipping solutions"
    },
    {
      url: "https://images.pexels.com/photos/2226458/pexels-photo-2226458.jpeg",
      title: "Smart Container Transport",
      description: "Advanced cargo handling with precision and care"
    },
    {
      url: "https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg",
      title: "Maritime Innovation",
      description: "Leading the way in eco-friendly shipping technology"
    },
    {
      url: "https://images.pexels.com/photos/1117211/pexels-photo-1117211.jpeg",
      title: "Sustainable Future",
      description: "Creating a greener tomorrow through responsible shipping"
    }
  ];

  return (
    
    <div className="relative w-full h-[600px] overflow-hidden">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="relative h-[600px]">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-center justify-center px-4"
            >
              <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-3xl text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800 drop-shadow">
                  {image.title}
                </h2>
                <p className="text-lg md:text-2xl text-gray-700 drop-shadow-sm">
                  {image.description}
                </p>
              </div>
            </motion.div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default ImageCarousel;
