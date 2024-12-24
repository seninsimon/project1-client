import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';


const ZenztoreFooter = () => {
    return (
        <footer className="bg-blue-950 text-white py-10 border-t">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">About Zenztore</h3>
                        <p className="text-sm">
                            Zenztore is your one-stop destination for the best products at unbeatable prices.
                            Discover a world of quality and convenience.
                        </p>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Customer Service</h3>
                        <ul>
                            <li className="mb-2">
                                <a className="hover:underline">
                                    Help Center
                                </a>
                            </li>
                            <li className="mb-2">
                                <a className="hover:underline">
                                    Returns & Refunds
                                </a>
                            </li>
                            <li className="mb-2">
                                <a className="hover:underline">
                                    Shipping Info
                                </a>
                            </li>
                            <li>
                                <a className="hover:underline">
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul>
                            <li className="mb-2">
                                <a className="hover:underline">
                                    New Arrivals
                                </a>
                            </li>
                            <li className="mb-2">
                                <a className="hover:underline">
                                    Best Sellers
                                </a>
                            </li>
                            <li className="mb-2">
                                <a className="hover:underline">
                                    Special Offers
                                </a>
                            </li>
                            <li>
                                <a className="hover:underline">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Stay Connected */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Stay Connected</h3>
                        <p className="text-sm mb-4">
                            Subscribe to our newsletter for updates on the latest deals and new products.
                        </p>
                        <form className="flex flex-col sm:flex-row items-center gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full sm:w-auto px-4 py-2 rounded-lg focus:outline-none text-gray-800"
                            />
                            <button
                                type="submit"
                                className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-white transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                        <div className="mt-4 flex gap-4">
                            <a href="https://facebook.com" className="hover:text-gray-200">
                                <FontAwesomeIcon icon={faFacebook} size="lg" />
                            </a>
                            <a href="https://twitter.com" className="hover:text-gray-200">
                                <FontAwesomeIcon icon={faTwitter} size="lg" />
                            </a>
                            <a href="https://instagram.com" className="hover:text-gray-200">
                                <FontAwesomeIcon icon={faInstagram} size="lg" />
                            </a>
                            <a href="https://linkedin.com" className="hover:text-gray-200">
                                <FontAwesomeIcon icon={faLinkedin} size="lg" />
                            </a>
                        </div>

                    </div>
                </div>

                <div className="mt-10 text-center text-sm">
                    <p>&copy; 2024 Zenztore. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default ZenztoreFooter;
