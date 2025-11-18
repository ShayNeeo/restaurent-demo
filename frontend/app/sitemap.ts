import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://nguyenrestaurant.de/',
      lastModified: new Date('2025-11-17'),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          de: 'https://nguyenrestaurant.de/',
          en: 'https://nguyenrestaurant.de/en',
          vi: 'https://nguyenrestaurant.de/vi',
        },
      },
    },
    {
      url: 'https://nguyenrestaurant.de/en',
      lastModified: new Date('2025-11-17'),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          de: 'https://nguyenrestaurant.de/',
          en: 'https://nguyenrestaurant.de/en',
          vi: 'https://nguyenrestaurant.de/vi',
        },
      },
    },
    {
      url: 'https://nguyenrestaurant.de/vi',
      lastModified: new Date('2025-11-17'),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          de: 'https://nguyenrestaurant.de/',
          en: 'https://nguyenrestaurant.de/en',
          vi: 'https://nguyenrestaurant.de/vi',
        },
      },
    },
    {
      url: 'https://nguyenrestaurant.de/menu',
      lastModified: new Date('2025-11-10'),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          de: 'https://nguyenrestaurant.de/menu',
          en: 'https://nguyenrestaurant.de/en/menu',
          vi: 'https://nguyenrestaurant.de/vi/menu',
        },
      },
    },
    {
      url: 'https://nguyenrestaurant.de/en/menu',
      lastModified: new Date('2025-11-10'),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          de: 'https://nguyenrestaurant.de/menu',
          en: 'https://nguyenrestaurant.de/en/menu',
          vi: 'https://nguyenrestaurant.de/vi/menu',
        },
      },
    },
    {
      url: 'https://nguyenrestaurant.de/vi/menu',
      lastModified: new Date('2025-11-10'),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          de: 'https://nguyenrestaurant.de/menu',
          en: 'https://nguyenrestaurant.de/en/menu',
          vi: 'https://nguyenrestaurant.de/vi/menu',
        },
      },
    },
    {
      url: 'https://nguyenrestaurant.de/coupon',
      lastModified: new Date('2025-11-15'),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          de: 'https://nguyenrestaurant.de/coupon',
          en: 'https://nguyenrestaurant.de/en/coupon',
          vi: 'https://nguyenrestaurant.de/vi/coupon',
        },
      },
    },
    {
      url: 'https://nguyenrestaurant.de/en/coupon',
      lastModified: new Date('2025-11-15'),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          de: 'https://nguyenrestaurant.de/coupon',
          en: 'https://nguyenrestaurant.de/en/coupon',
          vi: 'https://nguyenrestaurant.de/vi/coupon',
        },
      },
    },
    {
      url: 'https://nguyenrestaurant.de/vi/coupon',
      lastModified: new Date('2025-11-15'),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          de: 'https://nguyenrestaurant.de/coupon',
          en: 'https://nguyenrestaurant.de/en/coupon',
          vi: 'https://nguyenrestaurant.de/vi/coupon',
        },
      },
    },
  ];
}

