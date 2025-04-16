import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllFutures } from "../store/slices/futuresSlice";

const FuturesList = () => {
  const dispatch = useDispatch();
  const { futures, loading, error } = useSelector((state) => state.futures);

  useEffect(() => {
    dispatch(fetchAllFutures());
  }, [dispatch]);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-white text-xl">Loading futures...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="bg-red-600/20 border border-red-600 text-red-200 p-4 rounded-lg mb-8">
          Error: {error}
        </div>
        <button
          onClick={() => dispatch(fetchAllFutures())}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Futures</h1>
        <Link
          to="/futures/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Create New
        </Link>
      </div>

      {futures.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <p className="text-gray-300 mb-4">No futures available yet.</p>
          <Link
            to="/futures/create"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Create the first one
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {futures.map((future) => (
            <div
              key={future.id}
              className={`bg-gray-800 p-6 rounded-lg border-l-4 ${
                future.isFulfilled ? "border-green-500" : "border-yellow-500"
              }`}
            >
              <h2 className="text-xl font-bold mb-2">{future.name}</h2>
              <p className="text-gray-300 mb-4 line-clamp-2">
                {future.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Expiry:</span>
                  <span>{formatDate(future.expiryDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Strike Price:</span>
                  <span>{future.strikePrice} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={
                      future.isFulfilled ? "text-green-400" : "text-yellow-400"
                    }
                  >
                    {future.isFulfilled ? "Fulfilled" : "Active"}
                  </span>
                </div>
              </div>

              <Link
                to={`/futures/${future.id}`}
                className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FuturesList;
