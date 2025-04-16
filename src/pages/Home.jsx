import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="text-white">
      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Welcome to Futures DApp
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Create, trade, and manage financial futures on the blockchain with our
          decentralized platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/futures"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Explore Futures
          </Link>
          <Link
            to="/login"
            className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Platform Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Create Futures</h3>
            <p className="text-gray-300">
              Create customized financial futures with specified expiry dates
              and strike prices.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Secure Transactions</h3>
            <p className="text-gray-300">
              All transactions are secured by blockchain technology, ensuring
              transparency and trust.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Manage Portfolio</h3>
            <p className="text-gray-300">
              Track and manage your futures portfolio with real-time updates and
              analytics.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="font-bold">1</span>
            </div>
            <h3 className="font-bold mb-2">Connect Wallet</h3>
            <p className="text-gray-300">
              Link your crypto wallet to get started
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="font-bold">2</span>
            </div>
            <h3 className="font-bold mb-2">Create Account</h3>
            <p className="text-gray-300">Create your personal account</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="font-bold">3</span>
            </div>
            <h3 className="font-bold mb-2">Explore Futures</h3>
            <p className="text-gray-300">
              Browse available futures or create your own
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="font-bold">4</span>
            </div>
            <h3 className="font-bold mb-2">Execute Trades</h3>
            <p className="text-gray-300">Buy, sell, or create futures easily</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
