import React from 'react';
import '../component-styles/featured.css';

const categories = [
  {
    name: 'Tennis',
    desc: 'Professional clay and grass courts available',
    link: '#',
    linkLabel: 'Browse Courts',
    img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0',
  },
  {
    name: 'Football',
    desc: '5-a-side and full turf pitches',
    link: '#',
    linkLabel: 'Find Pitches',
    img: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
  },
  {
    name: 'Cricket',
    desc: 'Indoor nets and match grounds',
    link: '#',
    linkLabel: 'View Grounds',
    img: 'https://images.unsplash.com/photo-1540747913346-19e32fc3e666',
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