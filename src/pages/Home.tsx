import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import VisionMission from '../components/VisionMission';
import Statistics from '../components/Statistics';
import LatestJournals from '../components/LatestJournals';
import LatestArticles from '../components/LatestArticles';
import IndexingRoadmap from '../components/IndexingRoadmap';
import SintaPackages from '../components/SintaPackages';
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
      <SintaPackages />
      <Footer />
    </>
  );
}
