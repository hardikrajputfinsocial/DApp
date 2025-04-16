import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFutureById,
  updateFuture,
  clearSuccess,
  clearError,
} from "../store/slices/futuresSlice";
import toast from "react-hot-toast";

const EditFuture = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentFuture, loading, error, success } = useSelector(
    (state) => state.futures
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    expiryDate: "",
    strikePrice: "",
  });

  const [privateKey, setPrivateKey] = useState("");

  // Fetch the future data when component mounts
  useEffect(() => {
    dispatch(fetchFutureById(id));
    return () => {
      // Clear any success/error state when component unmounts
      dispatch(clearSuccess());
      dispatch(clearError());
    };
  }, [dispatch, id]);

  // Populate the form when future data is available
  useEffect(() => {
    if (currentFuture) {
      // Convert Unix timestamp to input-friendly datetime format
      const expiryDate = new Date(currentFuture.expiryDate * 1000);

      // Format for datetime-local input (YYYY-MM-DDThh:mm)
      const formattedDate = expiryDate.toISOString().slice(0, 16);

      setFormData({
        name: currentFuture.name,
        description: currentFuture.description,
        expiryDate: formattedDate,
        strikePrice: currentFuture.strikePrice,
      });
    }
  }, [currentFuture]);

  // Redirect after successful update
  useEffect(() => {
    if (success) {
      toast.success("Future updated successfully!");
      navigate(`/futures/${id}`);
    }
  }, [success, navigate, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!privateKey) {
      toast.error("Private key is required");
      return;
    }

    try {
      // Convert expiry date to timestamp (seconds since epoch)
      const expiryTimestamp = Math.floor(
        new Date(formData.expiryDate).getTime() / 1000
      );

      const updateData = {
        ...formData,
        expiryDate: expiryTimestamp,
      };

      await dispatch(updateFuture({ id, updateData, privateKey }));
    } catch (err) {
      toast.error(err.message || "Failed to update future");
    }
  };

  if (loading && !currentFuture) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-white text-xl">Loading future details...</div>
      </div>
    );
  }

  if (error && !currentFuture) {
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

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-8">Edit Future</h1>

      {error && (
        <div className="bg-red-600/20 border border-red-600 text-red-200 p-4 rounded-lg mb-8">
          Error: {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-300 mb-2">
              Future Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="expiryDate" className="block text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="datetime-local"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="strikePrice" className="block text-gray-300 mb-2">
                Strike Price (ETH)
              </label>
              <input
                type="number"
                id="strikePrice"
                name="strikePrice"
                value={formData.strikePrice}
                onChange={handleChange}
                required
                step="0.00001"
                min="0"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="privateKey" className="block text-gray-300 mb-2">
              Your Private Key
            </label>
            <input
              type="password"
              id="privateKey"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              required
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your private key to sign the transaction"
            />
            <p className="text-gray-400 text-sm mt-1">
              Your key is only used for this transaction and never stored.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/futures/${id}`)}
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Updating..." : "Update Future"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFuture;
