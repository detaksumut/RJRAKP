import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import VisionMission from '../components/VisionMission';
import Statistics from '../components/Statistics';
import LatestJournals from '../components/LatestJournals';
import LatestArticles from '../components/LatestArticles';
import IndexingRoadmap from '../components/IndexingRoadmap';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Statistics />
      <VisionMission />
      <LatestJournals />
      <IndexingRoadmap />
      <LatestArticles />
      <Footer />
    </>
  );
}
