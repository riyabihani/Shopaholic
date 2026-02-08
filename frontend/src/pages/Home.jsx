import React, { useState, useEffect } from 'react'
import Hero from '../components/Layout/Hero'
import GenderCollectionSection from '../components/Products/GenderCollectionSection'
import NewArrivals from '../components/Products/NewArrivals'
import ProductDetails from '../components/Products/ProductDetails'
import ProductGrid from '../components/Products/ProductGrid'
import FeaturedCollection from '../components/Products/FeaturedCollection'
import FeaturesSection from '../components/Products/FeaturesSection'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductsByFilters } from '../redux/slices/productsSlice'
import axios from 'axios'

// const placeholderProducts = [
//     {
//         _id: 1,
//         name: "Product 1",
//         price: 100,
//         images: [
//             {
//                 url: "https://picsum.photos/500/500?random=1",
//                 altText: "Product 1"
//             },
//         ]
//     },
//     {
//         _id: 2,
//         name: "Product 2",
//         price: 100,
//         images: [
//             {
//                 url: "https://picsum.photos/500/500?random=2",
//                 altText: "Product 2"
//             },
//         ]
//     },
//     {
//         _id: 3,
//         name: "Product 3",
//         price: 100,
//         images: [
//             {
//                 url: "https://picsum.photos/500/500?random=3",
//                 altText: "Product 3"
//             },
//         ]
//     },
//     {
//         _id: 4,
//         name: "Product 4",
//         price: 100,
//         images: [
//             {
//                 url: "https://picsum.photos/500/500?random=4",
//                 altText: "Product 4"
//             },
//         ]
//     },
//     {
//         _id: 5,
//         name: "Product 5",
//         price: 100,
//         images: [
//             {
//                 url: "https://picsum.photos/500/500?random=5",
//                 altText: "Product 5"
//             },
//         ]
//     },
//     {
//         _id: 6,
//         name: "Product 6",
//         price: 100,
//         images: [
//             {
//                 url: "https://picsum.photos/500/500?random=6",
//                 altText: "Product 6"
//             },
//         ]
//     },
//     {
//         _id: 7,
//         name: "Product 7",
//         price: 100,
//         images: [
//             {
//                 url: "https://picsum.photos/500/500?random=7",
//                 altText: "Product 7"
//             },
//         ]
//     },
//     {
//         _id: 8,
//         name: "Product 8",
//         price: 100,
//         images: [
//             {
//                 url: "https://picsum.photos/500/500?random=8",
//                 altText: "Product 8"
//             },
//         ]
//     },
// ];

const Home = () => {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.products) // accessing data from the redux store
    const [bestSellerProduct, setBestSellerProduct ] = useState(null);

    useEffect(() => {
        // fetch products for a specific collection
        dispatch(fetchProductsByFilters({
            gender: "Women",
            category: "Bottom Wear",
            limit: 8
        }));

        // fetch the best seller product
        const fetchBestSeller = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`);
                setBestSellerProduct(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchBestSeller();
    }, [dispatch]);

    return (
        <div>
            <Hero />
            <GenderCollectionSection />
            <NewArrivals />

            {/* Best Seller */}
            <h2 className='text-3xl text-center font-bold mb-4'>Best Seller</h2>
            {bestSellerProduct ? (<ProductDetails productId={bestSellerProduct._id} />) : (
                <p className='text-center'>Loading best selling product...</p>
            )}

            {/* Women's Section */}
            <div className='container mx-auto'>
                <h2 className='font-bold mb-4 text-3xl text-center'>Top Wear for Women</h2>
                <ProductGrid products={products} loading={loading} error={error} />
            </div>

            {/* Featured Collection Section */}
            <FeaturedCollection />
            <FeaturesSection />
        </div>
    )
}

export default Home