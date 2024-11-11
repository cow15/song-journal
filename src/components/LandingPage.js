import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const DEMO_ENTRIES = [
    {
      id: 1,
      title: "Seven Nation Army",
      artist: "The White Stripes",
      album: "Elephant",
      date: "March 15, 2024",
      imagePath: "/images/albums/album1.jpg",
      description: "That bass line hits different on vinyl. Perfect soundtrack for a rainy afternoon writing session."
    },
    {
      id: 2,
      title: "Hotel Yorba",
      artist: "The White Stripes",
      album: "White Blood Cells",
      date: "March 10, 2024",
      imagePath: "/images/albums/album2.jpg",
      description: "Found this gem digging through old country-inspired rock. The raw energy is infectious!"
    },
    {
      id: 3,
      title: "Fell in Love with a Girl",
      artist: "The White Stripes",
      album: "White Blood Cells",
      date: "March 3, 2024",
      imagePath: "/images/albums/album3.jpg",
      description: "Two minutes of pure garage rock perfection. Sometimes less is more."
    },
    {
      id: 4,
      title: "The Hardest Button to Button",
      artist: "The White Stripes",
      album: "Elephant",
      date: "February 25, 2024",
      imagePath: "/images/albums/album4.jpg",
      description: "That drum pattern is hypnotic. Been practicing this one on guitar all week."
    },
    {
      id: 5,
      title: "Blue Orchid",
      artist: "The White Stripes",
      album: "Get Behind Me Satan",
      date: "February 18, 2024",
      imagePath: "/images/albums/album5.jpg",
      description: "That guitar tone! Discovered this while making a playlist for a road trip."
    }
  ];

  return (
    <div className="landing-page">
      <header className="hero">
        <h1>Song Journal</h1>
        <p className="tagline">Your personal music diary, powered by Spotify</p>
        <Link to="/login" className="cta-button">
          Start Your Journal with Spotify
        </Link>
      </header>

      <section className="demo-section">
        <h2>Track Your Musical Journey</h2>
        <div className="demo-journal">
          {DEMO_ENTRIES.map(entry => (
            <div key={entry.id} className="demo-entry">
              <img src={entry.imagePath} alt={`${entry.album} album cover`} />
              <div className="demo-content">
                <h3>{entry.title}</h3>
                <p className="artist">{entry.artist}</p>
                <p className="date">{entry.date}</p>
                <p className="description">{entry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>🎵 Connect with Spotify</h3>
            <p>Easily add songs from your Spotify library</p>
          </div>
          <div className="feature">
            <h3>📝 Personal Notes</h3>
            <p>Write your thoughts and memories for each song</p>
          </div>
          <div className="feature">
            <h3>📊 Track History</h3>
            <p>See your musical journey over time</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 