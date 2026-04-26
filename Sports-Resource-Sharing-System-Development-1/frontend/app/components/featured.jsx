import React from 'react';
import '../component-styles/featured.css';

const categories = [
  {
    name: 'Tennis',
    desc: 'Professional clay and grass courts available',
    link: '#',
    linkLabel: 'Browse Courts',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLmO_GsfHEkioLe6mmbQAgiUyPrxZlXBT1FKOBCI4msvoVA6QjXM7C_dnBk3ncF3Tt5suvdh0WDD9QCVKKrQXaeDfjkyxbLWapG0-0nHAxQGHrO9dZSdC_Wa5ieoMtXm0iM4Pi7YOuArBlBai4oKYe2Q_NguxVMsAMqW2Q8CPh53VMqsfTIeKMRgq0bVYFWfbOsydlgqu8D53392TXg1UGm0Sc4AdvXw44E92ETj6z-_bMU-D9aeCd8cS9u8Xpwwl-RBJYnwBDLoU',
  },
  {
    name: 'Football',
    desc: '5-a-side and full turf pitches',
    link: '#',
    linkLabel: 'Find Pitches',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZyp9RQtUsj_YJJ8OBLJWElkC1QFnD1DW8-1sOSJw9Cd7zvqsbdV8EwjiPAG_VyJU66ALu7rVkLWDtTesf9XwrvWl6VcctTYW_9Oqh0oB3XWRy9URVNhHBgjF1CJGPmzOwKsuAHnMmkrUdikRy9WBhdGP_G3crc3azef4ZU15IsG388qUUAMDwLnvzSWuW9G3XDGtS3d-gELyQhcDMpQRG-B4rCvP25GLdeYRdS-NjF0wVxgdTLOEfK0bMbKZAen5avsaVb0fnPKU',
  },
  {
    name: 'Cricket',
    desc: 'Indoor nets and match grounds',
    link: '#',
    linkLabel: 'View Grounds',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB22IeWQEZ9TxWN9mlkxoGtp9MHXFkTano1Dg2we6skQm_z8LRVwQhtdr7UkxqCqsrNWtwzI4ebH8ombj1ghLL0o-dnJnFMQDStj2zmUUkJUov_NrLRDVBfNfV6ule2a7-3_Na_SSyhK8en3eASawqzjtNnVEruEOuj4ymNRseEE0TsNOhR08YF0HUw_rTIcp_lUk_6zQu4F3pqPVIgfOI-GnrM7dLTaUNAEF55wCiel7CcPIL63eByh18jueL9Ni1YbdbJp7av2xU',
  },
];

const FeaturedCategories = () => {
  return (
    <section className="featured-cats" data-purpose="featured-sports">
      <div className="featured-cats-container">
        <h2 className="featured-cats-title">Featured Categories</h2>
        <div className="cats-grid">
          {categories.map((cat, index) => (
            <div key={index} className="cat-card">
              <img src={cat.img} alt={cat.name} className="cat-img" />
              <div className="cat-overlay" />
              <div className="cat-info">
                <h4 className="cat-name">{cat.name}</h4>
                <p className="cat-desc">{cat.desc}</p>
                <a href={cat.link} className="cat-link">{cat.linkLabel}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;