import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  'Mouse',
  'Keyboard',
  'Monitor',
  'Processor',
  'Cabinet',
  'RAM',
  'Motherboard',
  'Graphics card'
];

const CategoryNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-800 text-white mt-16">
      <ul className="flex justify-center gap-6 space-x-4 p-3">
        {categories.map((category) => (
          <li key={category} className="relative group">
            <button onClick={() => navigate(`/category/${category.toLowerCase().replace(/\s+/g, "")}`)} className="hover:text-yellow-500">
              {category}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryNav;