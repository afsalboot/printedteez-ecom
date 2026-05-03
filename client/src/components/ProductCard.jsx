import React from "react";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toggleWishlist } from "../redux/slices/wishlistSlice";

const ProductCard = ({ id, image, title, price, badge }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth || {});
  const { items: wishlistItems = [], loading: wishlistLoading } = useSelector(
    (state) => state.wishlist || {}
  );

  const isWishlisted = wishlistItems.some(
    (item) => (item?._id || item)?.toString() === id?.toString()
  );
  const displayPrice =
    price === null || price === undefined || price === "" ? "--" : price;

  const goToDetails = () => {
    navigate(`/product/${id}`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();

    if (!token) {
      alert("Please log in to save products to your wishlist.");
      navigate("/login");
      return;
    }

    dispatch(toggleWishlist(id)).then((result) => {
      if (!result?.ok && result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <article
      onClick={goToDetails}
      className="group relative w-full cursor-pointer overflow-hidden rounded-[1.9rem] border border-black/5 bg-[linear-gradient(180deg,_#fffdfb_0%,_#fff6ef_100%)] shadow-[0_14px_36px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_56px_rgba(15,23,42,0.12)]"
    >
      {badge && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-[#B21A15] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_10px_24px_rgba(178,26,21,0.24)]">
          {badge}
        </span>
      )}

      <button
        type="button"
        onClick={handleWishlistToggle}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition ${
          isWishlisted
            ? "border-[#B21A15] bg-[#B21A15] text-white shadow-lg shadow-[#B21A15]/20"
            : "border-white/70 bg-white/88 text-gray-700 hover:border-[#B21A15] hover:text-[#B21A15]"
        } ${wishlistLoading ? "pointer-events-none opacity-70" : ""}`}
      >
        <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
      </button>

      <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(145deg,_#f7ede5_0%,_#eee2d6_100%)]">
        <div className="absolute inset-x-[14%] bottom-5 h-12 rounded-full bg-black/10 blur-2xl" />
        <img
          src={image || "/placeholder.png"}
          alt={title || "product"}
          className="relative h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/15 via-black/0 to-transparent opacity-80" />
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B21A15]/70">
            PrintedTeez
          </p>
          <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-6 text-gray-900 sm:text-base">
            {title}
          </h3>
          <p className="mt-3 text-xl font-semibold text-gray-950">
            {displayPrice === "--" ? "Rs. --" : `Rs. ${displayPrice}`}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${id}`);
          }}
          className="inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#B21A15] hover:bg-[#B21A15] hover:text-white"
        >
          View Product
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
