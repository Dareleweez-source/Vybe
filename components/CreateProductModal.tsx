import React, { useState } from 'react';
import type { User, Product } from '../types';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (productData: Omit<Product, 'id' | 'seller'>, fileDataUrl: string) => void;
  currentUser: User;
}

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const dataUrl = await fileToDataURL(file);
      setImagePreview(dataUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !price || !imageFile || !imagePreview) {
      setError('All fields, including an image, are required.');
      return;
    }
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Please enter a valid price.');
      return;
    }
    setError('');

    // FIX: Add missing properties `category` and `rating` to match the expected type.
    const productData = {
        name,
        description,
        price: priceValue,
        imageUrl: '', // This will be replaced by the data URL
        category: 'Uncategorized',
        rating: 0,
    };
    
    // We pass the dataUrl separately because the final product object in state should have it.
    onCreate(productData, imagePreview);
    
    // Reset state and close
    setName('');
    setDescription('');
    setPrice('');
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };
  
  const handleClose = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImageFile(null);
    setImagePreview(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-background dark:bg-dark-background rounded-2xl w-full max-w-md shadow-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
          <h2 id="create-product-title" className="text-xl font-bold">List a new Product</h2>
          <button onClick={handleClose} className="text-on-surface dark:text-dark-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface" aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary">Product Name</label>
            <input type="text" id="product-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-dark-border rounded-md bg-surface dark:bg-dark-surface border p-2 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary">Description</label>
            <textarea id="product-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-dark-border rounded-md bg-surface dark:bg-dark-surface border p-2 focus:ring-primary focus:border-primary"></textarea>
          </div>
          <div>
            <label htmlFor="product-price" className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary">Price ($)</label>
            <input type="number" id="product-price" value={price} onChange={e => setPrice(e.target.value)} step="0.01" min="0.01" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-dark-border rounded-md bg-surface dark:bg-dark-surface border p-2 focus:ring-primary focus:border-primary" />
          </div>
          <div>
             <label className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary">Product Image</label>
             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-dark-border border-dashed rounded-md">
                 <div className="space-y-1 text-center">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Product preview" className="mx-auto h-24 w-auto" />
                    ) : (
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-background dark:bg-dark-background rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                 </div>
             </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50">
            List Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
