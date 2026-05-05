import { Ticket, Truck, Zap } from "lucide-react";
import { useSelector } from "react-redux";

const formatOffer = (offer) => {
  const discount =
    offer.discountType === "percentage"
      ? `${offer.amount}% OFF`
      : `Rs. ${offer.amount} OFF`;

  return `Use code ${offer.code} for ${discount}`;
};

const LiveOffers = () => {
  const { activeOffers, loading } = useSelector((state) => state.coupon);

  if (loading) {
    return (
      <div className="border-b border-black/5 bg-[#f3ebe2] px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#7b2b21] dark:border-white/8 dark:bg-[#17131a] dark:text-[#f0c8c1]">
        Checking offers...
      </div>
    );
  }

  if (!activeOffers || activeOffers.length === 0) {
    return (
      <div className="border-b border-black/5 bg-[#f3ebe2] px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#7b2b21] dark:border-white/8 dark:bg-[#17131a] dark:text-[#f0c8c1]">
        Fresh drops added weekly
      </div>
    );
  }

  const offerToShow = activeOffers[0];
  const offerText = formatOffer(offerToShow);

  return (
    <>
      <style>{`
        @keyframes live-offer-marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
      <div className="border-b border-black/5 bg-[#f3ebe2] text-[#201715] dark:border-white/8 dark:bg-[linear-gradient(90deg,_rgba(24,18,24,0.98),_rgba(43,20,20,0.96),_rgba(24,18,24,0.98))] dark:text-[#f7ece8]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7b2b21] dark:text-[#ffb7ad]">
            <Ticket className="h-3.5 w-3.5 animate-pulse" />
          Live Offer
          </div>

          <div className="min-w-0 flex-1 overflow-hidden text-sm font-medium text-[#2c211e] dark:text-[#f6e9e5]">
            <div
              className="flex w-max items-center"
              style={{ animation: "live-offer-marquee 18s linear infinite" }}
            >
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="flex shrink-0 items-center gap-8 pr-8"
                >
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <Zap className="h-3.5 w-3.5 shrink-0 text-[#B21A15]" />
                    {offerText}
                  </span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-[#6d605c] dark:text-[#d0bbb5]">
                    <Truck className="h-3.5 w-3.5 shrink-0" />
                    Fast dispatch across India
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#6d605c] dark:text-[#ceb7b0] md:inline-flex">
            <Truck className="h-3.5 w-3.5" />
            Fast Dispatch
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveOffers;
