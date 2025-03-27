import Image from "next/image";
import Link from "next/link";

const gridItems = [
  {
    href: "/gwm",
    imgSrc: "/Images/GridSection/gwm.webp",
    alt: "Ground Water Management",
    title: "Ground Water Management",
    acronym: "GWM",
  },
  {
    href: "/rwm",
    imgSrc: "/Images/GridSection/rwm.jpeg",
    alt: "River Water Management",
    title: "River Water Management",
    acronym: "RWM",
  },
  {
    href: "/wrm",
    imgSrc: "/Images/GridSection/wrm.jpg",
    alt: "Water Resource Management",
    title: "Water Resource Management",
    acronym: "WRM",
  },
  {
    href: "/shsd",
    imgSrc: "/Images/GridSection/shs.jpeg",
    alt: "Socio-Hydrological System",
    title: "Socio-Hydrological System",
    acronym: "SHSD",
  },
  {
    href: "/basic",
    imgSrc: "/Images/GridSection/basicmodule.jpg",
    alt: "Basic Module",
    title: "Basic Module",
    acronym: null,
  }
];

export default function GridSection() {
  return (
    <section className="py-5 flex justify-center items-center max-w-[80%] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 w-full">
        {gridItems.map((item, index) => (
          <Link href={item.href} key={index} passHref>
            <div
              className="grid-item bg-white rounded-xl shadow-lg text-center p-5 cursor-pointer 
                transform transition-all duration-300 ease-in-out hover:scale-[1.3] hover:shadow-2xl 
                hover:z-10 relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Image
                src={item.imgSrc}
                alt={item.alt}
                width={200}
                height={140}
                className="w-full h-[140px] object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg text-gray-800 mb-1">
                {item.title}{" "}
                {item.acronym && (
                  <span className="text-blue-600">({item.acronym})</span>
                )}
              </h3>
              <p className="text-sm text-gray-600"></p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}