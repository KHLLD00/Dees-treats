import Image from "next/image";
import { GALLERY, PHOTO_SIZE } from "@/lib/gallery";

export default function PhotosSection() {
  return (
    <section id="photos" className="scroll-mt-20 bg-frosting-soft">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <h2 className="font-display text-5xl font-black md:text-6xl">Photos</h2>
        {GALLERY.map((group) => (
          <div key={group.title} className="mt-10">
            <h3 className="font-display text-2xl font-bold">{group.title}</h3>
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {group.photos.map((photo) => (
                <li key={photo.src}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    {...PHOTO_SIZE}
                    className="aspect-[4/5] w-full rounded-lg object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
