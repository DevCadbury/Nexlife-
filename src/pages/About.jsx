import React from 'react';

import MissionVision from '../components/MissionVision';
import { motion } from 'framer-motion';
import { Award, Users, Globe, TrendingUp } from 'lucide-react';
import aboutImage from '../assets/images/about_us.png';
import nexlifeVideo from '../assets/images/nexlife_video.mp4';
import mapImg from '../assets/images/map.png';

const StatCard = ({ icon: Icon, value, label, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-xl transition-shadow duration-300"
  >
    <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-4 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
    <p className="text-slate-500 font-medium">{label}</p>
  </motion.div>
);

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans">


      {/* Hero Section */}
      <section className="relative py-32 bg-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 transform scale-105"
          style={{ backgroundImage: `url(${aboutImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-slate-900/60 to-slate-900"></div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              About <span className="text-primary-400">Nexlife</span>
            </h1>
            <div className="h-1.5 w-24 bg-primary-500 mx-auto rounded-full mb-8"></div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Bridging the gap between quality healthcare and global accessibility.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-3xl opacity-20 blur-xl transform rotate-3"></div>
              <video
                src={nexlifeVideo}
                autoPlay
                muted
                loop
                playsInline
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                className="relative rounded-2xl shadow-2xl w-full border border-slate-100 object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 leading-tight">
                Who We Are
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  <strong className="text-slate-900">Nexlife International</strong> is a dynamic and rapidly growing pharmaceutical company based in India. We are committed to providing high-quality, affordable medicines to patients worldwide.
                </p>
                <p>
                  With a strong focus on innovation and quality compliance, we have established ourselves as a trusted partner for healthcare providers in over 50 countries. Our state-of-the-art manufacturing facilities adhere to strict <strong className="text-primary-600">WHO-GMP guidelines</strong>.
                </p>
                <div className="pl-6 border-l-4 border-primary-500 italic text-slate-700 bg-slate-50 py-4 pr-4 rounded-r-lg">
                  "We believe that healthcare is a fundamental right, not a privilege. That's why we work tirelessly to ensure our diverse portfolio of pharmaceutical products reaches those who need them most."
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
            <StatCard icon={Globe} value="50+" label="Countries" delay={0} />
            <StatCard icon={Award} value="500+" label="Products" delay={0.1} />
            <StatCard icon={Users} value="1000+" label="Happy Clients" delay={0.2} />
            <StatCard icon={TrendingUp} value="15+" label="Years Experience" delay={0.3} />
          </div>

        </div>
      </section>

      {/* Reuse Mission Vision Component */}
      <MissionVision />

      {/* Global Presence */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-20"
          style={{ backgroundImage: `url(${mapImg})` }}
        />
        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Globe className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold mb-6"
          >
            Global Footprint
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto mb-12"
          >
            Delivering health across borders. Our products are trusted by healthcare professionals in over{' '}
            <span className="text-white font-bold">50+ countries</span>.
          </motion.p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm font-medium text-slate-400">
            {['South East Asia', 'Africa', 'Latin America', 'CIS Countries', 'Middle East', 'Europe'].map((region, i) => (
              <motion.div
                key={region}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/50 hover:text-white transition-all duration-300 cursor-default"
              >
                {region}
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-white/10 backdrop-blur-md">
              <h3 className="text-2xl font-bold mb-2">Interested in Importing?</h3>
              <p className="text-slate-300 mb-6">Partner with us for reliable pharmaceutical supply.</p>
              <a
                href="/contact"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/50 inline-block"
              >
                Become a Partner
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Certifications (Visual Strip) */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Accreditations & Certifications</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-16">
              Our commitment to quality is validated by leading global health authorities.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {[
              { name: "WHO-GMP", color: "border-blue-200 text-blue-700 bg-blue-50" },
              { name: "ISO 9001:2015", color: "border-green-200 text-green-700 bg-green-50" },
              { name: "FSSAI", color: "border-orange-200 text-orange-700 bg-orange-50" },
              { name: "HACCP", color: "border-red-200 text-red-700 bg-red-50" }
            ].map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, shadow: "lg" }}
                className={`h-24 w-48 ${cert.color} border-2 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 cursor-default`}
              >
                <span className="font-bold text-xl">{cert.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
