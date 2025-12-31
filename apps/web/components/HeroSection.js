import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* LEFT CONTENT */}
          <div className="px-6 md:px-6 lg:px-6 py-16 lg:py-24 flex flex-col justify-center">
            <h1
              className="text-5xl sm:text-6xl lg:text-5xl font-extrabold leading-tight text-[#10375C]"
              style={{ lineHeight: 1.02 }}
            >
              Welcome to
              <br />
              The Digital Rest House
              <br />
              Booking System
            </h1>

            <h2 className="mt-6 text-lg md:text-xl font-semibold text-black">
              Official Rest House Accommodation Portal
            </h2>

            <p className="mt-4 max-w-xl text-base md:text-lg text-gray-700">
              The Government of Maharashtra introduces a seamless, transparent,
              and efficient digital platform for booking official rest house
              accommodations across the State.
            </p>

            <div className="mt-8 flex items-center gap-8">
              <Link
                href="#book"
                className="inline-flex items-center justify-center rounded-md px-6 py-3 shadow-sm text-white text-lg font-semibold bg-[#FF5722] hover:bg-[#e64b1f] transition"
                aria-label="Book Now"
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative h-80 sm:h-[420px] lg:h-[720px] w-full lg:col-start-2 lg:col-end-3">
            <div className="absolute inset-0 right-0 w-screen lg:w-[calc(100vw-50%)]">
              <Image
                src="/images/rest-house.png"
                alt="Rest house"
                fill
                className="object-cover"
                style={{ objectPosition: "50% 15%" }}
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
