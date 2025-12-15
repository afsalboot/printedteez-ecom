import { useSelector } from "react-redux";

const WELCOME_ELIGIBLE_DAYS = 15; // show welcome offer for first 15 days

const LiveOffers = () => {
  const { activeOffers, loading } = useSelector((state) => state.coupon);
  const { user } = useSelector((state) => state.auth);

  const formatOffer = (offer) => {
    const discount =
      offer.discountType === "percentage"
        ? `${offer.amount}% OFF`
        : `₹${offer.amount} OFF`;

    return `Use code ${offer.code} & get ${discount}`;
  };

  // Loading and no-offer UI
  if (loading) {
    return (
      <div className="w-full text-center text-sm py-1 bg-[#270000] text-white">
        Checking offers...
      </div>
    );
  }

  if (!activeOffers || activeOffers.length === 0) {
    return (
      <div className="w-full text-center text-sm py-1 bg-[#270000] text-white">
        No active offers right now
      </div>
    );
  }

  // Welcome logic
  const welcomeOffer = activeOffers.find((o) => o.code === "WELCOME");
  const generalOffers = activeOffers.filter((o) => o.code !== "WELCOME");

  let offersToShow = generalOffers;

  if (user) {
    const accountAgeInDays = Math.floor(
      (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
    );

    const hasUsedWelcome = user?.hasUsedWelcomeOffer;

    const isEligibleForWelcome =
      accountAgeInDays <= WELCOME_ELIGIBLE_DAYS && !hasUsedWelcome && welcomeOffer;

    if (isEligibleForWelcome) {
      offersToShow = [welcomeOffer];
    }
  }

  // Fallback: if filtering results in no offers, show the first active offer
  if (!offersToShow.length) {
    offersToShow = [activeOffers[0]];
  }

  const offerToShow = offersToShow[0];

  if (!offerToShow) {
    return (
      <div className="w-full text-center text-sm py-1 bg-[#270000] text-white">
        No active offers right now
      </div>
    );
  }

  return (
    <div className="w-full bg-[#270000] text-white text-center">
      <span className="mx-4 text-[12px] font-thin whitespace-nowrap">
        🎉 {formatOffer(offerToShow)}
      </span>
    </div>
  );
};

export default LiveOffers;
