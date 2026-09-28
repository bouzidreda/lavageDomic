import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleMapPlaceholder({ lat, lng }: { lat?: number; lng?: number }) {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const g = window.google;
    if (!g || !divRef.current || lat === undefined || lng === undefined) return;

    const map = new g.maps.Map(divRef.current, {
      center: { lat, lng },
      zoom: 14,
      disableDefaultUI: true
    });
    new g.maps.Marker({ position: { lat, lng }, map });
  }, [lat, lng]);

  return (
    <div className="rounded-xl border overflow-hidden">
      {window.google && lat !== undefined && lng !== undefined ? (
        <div ref={divRef} className="h-56 w-full" />
      ) : (
        <div className="h-56 w-full grid place-items-center text-sm text-neutral-600 bg-neutral-50">
          Google Maps API ready: add script key and this area becomes interactive.
        </div>
      )}
    </div>
  );
}