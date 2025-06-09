import { Link } from 'wouter';

const HeroSection = () => {
  return (
    <section className="relative h-[500px] md:h-[600px] bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"}}>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 font-poppins">Discover Your Style</h1>
        <p className="text-lg md:text-xl mb-8 max-w-xl">Find personalized fashion recommendations that match your unique taste.</p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/quiz" className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg">
            Take the Style Quiz
          </Link>
          <Link href="/products" className="bg-white hover:bg-gray-100 text-secondary font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg">
            Browse Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
