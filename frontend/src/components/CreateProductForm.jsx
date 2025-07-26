import { useState } from "react";
import { motion } from "framer-motion";
import { Loader, PlusCircle, Upload } from "lucide-react";
import { useProductsStore } from "../stores/useProductStore";

const categories = [
  "jeans",
  "t-shirts",
  "shoes",
  "glasses",
  "jackets",
  "suits",
  "bags",
];
const CreateProductForm = () => {
  const [newProdut, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const { createProduct, loading } = useProductsStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(newProdut);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
      });
    } catch {
      console.log("error creating a product");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProdut, image: reader.result });
        // set Base64 string into state
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      className="bg-gray-300 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-amber-600">
        Create New Product
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-900"
          >
            Product Name
          </label>
          <input
            type="text"
            id="name"
            value={newProdut.name}
            onChange={(e) =>
              setNewProduct({ ...newProdut, name: e.target.value })
            }
            className="mt-1 block w-full bg-gray-200 border border-gray-900 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-900"
          >
            Description
          </label>
          <textarea
            type="description"
            id="description"
            value={newProdut.description}
            onChange={(e) =>
              setNewProduct({ ...newProdut, description: e.target.value })
            }
            rows="3"
            className="mt-1 block w-full bg-gray-200 border border-gray-900 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-900"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={newProdut.price}
            onChange={(e) =>
              setNewProduct({ ...newProdut, price: e.target.value })
            }
            step={"1"}
            className="mt-1 block w-full bg-gray-200 border border-gray-900 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-900"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={newProdut.category}
            onChange={(e) =>
              setNewProduct({ ...newProdut, category: e.target.value })
            }
            className="mt-1 block w-full bg-gray-200 border border-gray-900 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            id="image"
            className="sr-only"
            accept="image/*"
            onChange={handleImageChange}
          />
          <label
            htmlFor="image"
            className=" bg-gray-200 cursor-pointer border border-gray-900 py-2 px-3 rounded-md shadow-sm text-sm-leading-4 font-medium text-gray-900 hover:bg-amber-600  hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
          >
            <Upload className="h-5 w-5 inline-block mr-2" />
            Upload Image
          </label>
          {newProdut.image && (
            <span className="ml-3 text-sm text-gray-900">Image uploaded</span>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium  text-gray-900 bg-amber-600 hover:bg-amber-700  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:border-amber-500 disabled:opacity-50 "
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader
                className="mr-2 h-5 w-5 animate-spin"
                aria-hidden="true"
              />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5 " />
              Create Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
