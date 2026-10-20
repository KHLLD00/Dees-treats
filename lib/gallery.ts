export type Photo = { src: string; alt: string };

// Photos are pre-cropped to 4:5 and 640x800 in public/gallery
export const PHOTO_SIZE = { width: 640, height: 800 };

const photo = (name: string, alt: string): Photo => ({ src: `/gallery/${name}.webp`, alt });

export const GALLERY = [
  {
    title: "Cakes",
    photos: [
      photo("cake-crown", "Pink buttercream cake with a gold crown, ribbons and Happy Birthday topper"),
      photo("cake-and-cupcakes", "Pink birthday cake with matching cupcakes topped with gold pearls"),
      photo("cake-pink-flowers", "Pink ruffled cake with a gold Happy Birthday topper and dried flowers"),
      photo("cake-yellow-roses", "Yellow buttercream cake with pink roses and sprinkles"),
      photo("cake-sprinkles", "Cream rosette cake covered in colourful sprinkles"),
      photo("cake-black-bows", "White cake decorated with black ribbon bows and pink roses"),
      photo("bento-cake", "Small black bento cake in a takeaway box with a piped message"),
    ],
  },
  {
    title: "Small chops",
    photos: [
      photo("chops-bowl", "Bowl of samosas, springroll and puff puff"),
      photo("chops-box", "Box of springroll, samosas and puff puff"),
      photo("chops-foil-box", "Small chops box with samosas, springroll, puff puff and beef"),
      photo("puff-puff-sieve", "Freshly fried puff puff in a sieve"),
      photo("puff-puff-bag", "Bagged puff puff next to a box of springroll"),
    ],
  },
  {
    title: "Bakes",
    photos: [
      photo("loaves-tray", "Baked loaves topped with Oreo, chocolate chips and toasted coconut"),
      photo("loaves-hand", "Hand holding a loaf topped with toasted coconut and chocolate chips"),
      photo("loaves-packed", "Individually wrapped loaves ready for delivery"),
      photo("buns", "Four golden buns in a sieve"),
    ],
  },
];

export const FEATURED = [
  GALLERY[0].photos[0],
  GALLERY[1].photos[1],
  GALLERY[0].photos[1],
  GALLERY[2].photos[0],
];
