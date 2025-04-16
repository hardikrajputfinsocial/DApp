import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFutureById, fulfillFuture } from "../store/slices/futuresSlice";
import toast from "react-hot-toast";

const FutureDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentFuture, loading, error, success } = useSelector(
    (state) => state.futures
  );
  const { user } = useSelector((state) => state.user);
  const [privateKey, setPrivateKey] = useState("");
  const [showFulfillModal, setShowFulfillModal] = useState(false);

  useEffect(() => {
    dispatch(fetchFutureById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (success) {
      setShowFulfillModal(false);
      toast.success("Future fulfilled successfully");
    }
  }, [success]);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleFulfill = async () => {
    if (!privateKey) {
      toast.error("Private key is required");
      return;
    }

    try {
      await dispatch(fulfillFuture({ id, privateKey }));
    } catch (error) {
      toast.error(error.message || "Failed to fulfill future");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-white text-xl">Loading future details...</div>
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
          onClick={() => dispatch(fetchFutureById(id))}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentFuture) {
    return (
      <div className="text-white py-8">
        <div className="bg-yellow-600/20 border border-yellow-600 text-yellow-200 p-4 rounded-lg mb-8">
          Future not found
        </div>
        <Link
          to="/futures"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Back to Futures List
        </Link>
      </div>
    );
  }

  const isCreator =
    user &&
    user.address &&
    currentFuture.creator.toLowerCase() === user.address.toLowerCase();

  return (
    <div className="text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">{currentFuture.name}</h1>
        <div className="flex gap-2">
          <Link
            to="/futures"
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
          >
            Back to List
          </Link>
          {isCreator && !currentFuture.isFulfilled && (
            <>
              <Link
                to={`/futures/edit/${currentFuture.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                Edit
              </Link>
              <button
                onClick={() => setShowFulfillModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
              >
                Fulfill
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <span
              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                currentFuture.isFulfilled ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></span>
            <span
              className={`font-bold ${
                currentFuture.isFulfilled ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {currentFuture.isFulfilled ? "Fulfilled" : "Active"}
            </span>
          </div>
          <p className="text-gray-300 whitespace-pre-line">
            {currentFuture.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-400 mb-1">Creator</h3>
              <p className="font-mono bg-gray-700 p-2 rounded">
                {currentFuture.creator}
              </p>
            </div>
            <div>
              <h3 className="text-gray-400 mb-1">Created</h3>
              <p>ID: {currentFuture.id}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-400 mb-1">Expiry Date</h3>
              <p>{formatDate(currentFuture.expiryDate)}</p>
            </div>
            <div>
              <h3 className="text-gray-400 mb-1">Strike Price</h3>
              <p className="text-xl font-bold">
                {currentFuture.strikePrice} ETH
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fulfill Modal */}
      {showFulfillModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Fulfill Future</h2>
            <p className="text-gray-300 mb-4">
              Are you sure you want to fulfill this future? This action is
              irreversible.
            </p>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">
                Enter your private key to confirm
              </label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                placeholder="Private key"
              />
              <p className="text-xs text-gray-400 mt-1">
                Your key is only used for this transaction and never stored.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFulfillModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleFulfill}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Fulfill"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureDetails;
